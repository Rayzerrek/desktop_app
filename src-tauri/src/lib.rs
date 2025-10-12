use serde::{Deserialize, Serialize};

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
            println!("✅ Login successful for user: {}", auth_response.user.id);

            Ok(AuthResponse {
                success: true,
                message: "Zalogowano pomyślnie".to_string(),
                user_id: Some(auth_response.user.id),
                access_token: auth_response.access_token,
                refresh_token: auth_response.refresh_token,
            })
        }
        Err(e) => {
            println!("❌ Login failed: {}", e);

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
                "✅ Registration successful for user: {}",
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
            println!("❌ Registration failed: {}", e);

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    {
        if let Err(e) = dotenvy::dotenv() {
            eprintln!("Warning: Could not load .env file: {}", e);
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![login_user, register_user])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
