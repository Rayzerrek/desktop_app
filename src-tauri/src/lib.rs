use serde::{Deserialize, Serialize};
use tauri::Manager;

mod supabase;
use supabase::{get_supabase_config, SupabaseClient};

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    success: bool,
    message: String,
    user_id: Option<String>,
    access_token: Option<String>,
    refresh_token: Option<String>,
}

fn create_supabase_client() -> Result<SupabaseClient, String> {
    let (url, anon_key) = get_supabase_config()?;
    Ok(SupabaseClient::new(url, anon_key))
}

#[tauri::command]
async fn login_user(email: String, password: String) -> Result<AuthResponse, String> {
    println!("Login attempt: email={}", email);

    let client = create_supabase_client()?;

    match client.sign_in(&email, &password).await {
        Ok(auth_response) => {
            println!("Login successful for user: {}", auth_response.user.id);

            Ok(AuthResponse {
                success: true,
                message: "Zalogowano pomyślnie".to_string(),
                user_id: Some(auth_response.user.id),
                access_token: auth_response.access_token,
                refresh_token: auth_response.refresh_token,
            })
        }
        Err(e) => {
            println!("Login failed: {}", e);

            Ok(AuthResponse {
                success: false,
                message: format!("Błąd logowania: {}", e),
                user_id: None,
                access_token: None,
                refresh_token: None,
            })
        }
    }
}

#[tauri::command]
async fn register_user(
    email: String,
    password: String,
    username: String,
) -> Result<AuthResponse, String> {
    println!("Register attempt: email={}, username={}", email, username);

    let client = create_supabase_client()?;

    match client.sign_up(&email, &password, &username).await {
        Ok(auth_response) => {
            println!(
                "Registration successful for user: {}",
                auth_response.user.id
            );

            let message = if auth_response.user.confirmation_sent_at.is_some() {
                format!(
                    "Konto {} zostało utworzone! Sprawdź swojego maila i potwierdź adres email.",
                    username
                )
            } else if auth_response.access_token.is_some() {
                format!("Konto {} zostało utworzone pomyślnie!", username)
            } else {
                format!(
                    "Konto {} zostało utworzone. Możesz się teraz zalogować.",
                    username
                )
            };

            Ok(AuthResponse {
                success: true,
                message,
                user_id: Some(auth_response.user.id),
                access_token: auth_response.access_token,
                refresh_token: auth_response.refresh_token,
            })
        }
        Err(e) => {
            println!("Registration failed: {}", e);

            Ok(AuthResponse {
                success: false,
                message: format!("Błąd rejestracji: {}", e),
                user_id: None,
                access_token: None,
                refresh_token: None,
            })
        }
    }
}

#[tauri::command]
async fn google_sign_in() -> Result<String, String> {
    let client = create_supabase_client()?;
    client.sign_in_with_google().await
}

#[tauri::command]
async fn check_is_admin(access_token: String) -> Result<bool, String> {
    let client = create_supabase_client()?;

    let response = client.get_user_profile_with_role(&access_token).await?;

    if let Some(role) = response.get("role").and_then(|r| r.as_str()) {
        Ok(role == "admin" || role == "super_admin")
    } else {
        Ok(false)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeValidationRequest {
    code: String,
    language: String,
    expected_output: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeValidationResponse {
    success: bool,
    output: String,
    error: Option<String>,
    is_correct: bool,
}

#[tauri::command]
async fn validate_code(
    code: String,
    language: String,
    expected_output: String,
) -> Result<CodeValidationResponse, String> {

    match language.as_str() {
        "python" => validate_python_code(code, expected_output).await,
        "javascript" => validate_javascript_code(code, expected_output).await,
        "typescript" => validate_typescript_code(code, expected_output).await,
        _ => Err(format!("Unsupported language: {}", language)),
    }
}

async fn validate_python_code(
    code: String,
    expected_output: String,
) -> Result<CodeValidationResponse, String> {
    use std::process::Command;

    let output = Command::new("python")
        .arg("-c")
        .arg(&code)
        .output();

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&result.stderr).trim().to_string();

            if !stderr.is_empty() {
                return Ok(CodeValidationResponse {
                    success: false,
                    output: stderr.clone(),
                    error: Some(stderr),
                    is_correct: false,
                });
            }

            let is_correct = stdout == expected_output;

            Ok(CodeValidationResponse {
                success: true,
                output: stdout,
                error: None,
                is_correct,
            })
        }
        Err(e) => Ok(CodeValidationResponse {
            success: false,
            output: String::new(),
            error: Some(format!("Nie można uruchomić Pythona: {}. Upewnij się, że Python jest zainstalowany.", e)),
            is_correct: false,
        }),
    }
}
async fn validate_typescript_code(
    code: String,
    expected_output: String,
) -> Result<CodeValidationResponse, String> {
    use std::fs;
    use std::path::PathBuf;
    use std::process::Command;
    use std::time::{SystemTime, UNIX_EPOCH};

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let pid = std::process::id();
    let filename = format!("validate_ts_{}_{}.ts", pid, now);

    let mut tmp_path: PathBuf = std::env::temp_dir();
    tmp_path.push(filename);

    if let Err(e) = fs::write(&tmp_path, code.as_bytes()) {
        return Ok(CodeValidationResponse {
            success: false,
            output: String::new(),
            error: Some(format!("Nie można zapisać pliku tymczasowego: {}", e)),
            is_correct: false,
        });
    }

    fn run_with_file(cmd: &str, file: &PathBuf) -> std::io::Result<std::process::Output> {
        Command::new(cmd)
            .env("TS_NODE_TRANSPILE_ONLY", "true")
            .env("TS_NODE_COMPILER_OPTIONS", r#"{"module":"commonjs","target":"es2019"}"#)
            .arg(file)
            .output()
    }

    let mut candidates: Vec<&str> = vec!["ts-node"];
    if cfg!(target_os = "windows") {
        candidates.extend_from_slice(&[
            "ts-node.cmd",
            ".\\node_modules\\.bin\\ts-node.cmd",
            "..\\node_modules\\.bin\\ts-node.cmd",
            "..\\..\\node_modules\\.bin\\ts-node.cmd",
        ]);
    } else {
        candidates.extend_from_slice(&[
            "./node_modules/.bin/ts-node",
            "../node_modules/.bin/ts-node",
            "../../node_modules/.bin/ts-node",
        ]);
    }

    let mut last_err: Option<String> = None;
    let mut chosen_output: Option<std::process::Output> = None;

    for cmd in candidates.iter() {
        match run_with_file(cmd, &tmp_path) {
            Ok(out) => {
                chosen_output = Some(out);
                break;
            }
            Err(e) => {
                last_err = Some(format!("{}", e));
            }
        }
    }

    let _ = fs::remove_file(&tmp_path);

    let output = match chosen_output {
        Some(out) => out,
        None => {
            return Ok(CodeValidationResponse {
                success: false,
                output: String::new(),
                error: Some(format!(
                    "Nie można znaleźć/uruchomić ts-node. Ostatni błąd: {}",
                    last_err.unwrap_or_else(|| "unknown error".to_string())
                )),
                is_correct: false,
            });
        }
    };

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

    if !stderr.is_empty() {
        return Ok(CodeValidationResponse {
            success: false,
            output: stderr.clone(),
            error: Some(stderr),
            is_correct: false,
        });
    }

    let is_correct = stdout == expected_output;
    Ok(CodeValidationResponse {
        success: true,
        output: stdout,
        error: None,
        is_correct,
    })
}

async fn validate_javascript_code(
    code: String,
    expected_output: String,
) -> Result<CodeValidationResponse, String> {
    use std::process::Command;

    let output = Command::new("node")
        .arg("-e")
        .arg(&code)
        .output();

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&result.stderr).trim().to_string();

            if !stderr.is_empty() {
                return Ok(CodeValidationResponse {
                    success: false,
                    output: stderr.clone(),
                    error: Some(stderr),
                    is_correct: false,
                });
            }

            let is_correct = stdout == expected_output;

            Ok(CodeValidationResponse {
                success: true,
                output: stdout,
                error: None,
                is_correct,
            })
        }
        Err(e) => Ok(CodeValidationResponse {
            success: false,
            output: String::new(),
            error: Some(format!("Nie można uruchomić Node.js: {}. Upewnij się, że Node.js jest zainstalowany.", e)),
            is_correct: false,
        }),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    {
        if let Err(e) = dotenvy::dotenv() {
            eprintln!("Warning: Could not load .env file: {}", e);
        }
    }

    tauri::Builder::default()
        .setup(|app| {
            if let Ok(prod_env) = app.path().resource_dir() {
                let env_path = prod_env.join(".env.production");
                if env_path.exists() {
                    dotenvy::from_path(env_path).ok();
                }
            }

            dotenvy::dotenv().ok();
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            login_user,
            register_user,
            google_sign_in,
            check_is_admin,
            validate_code,
            supabase::get_all_courses,
            supabase::get_lesson_by_id,
            supabase::create_course,
            supabase::create_module,
            supabase::create_lesson,
            supabase::update_lesson,
            supabase::delete_lesson,
            supabase::delete_course
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
