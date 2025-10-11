use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    email: String,
    password: String,
    username: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    success: bool,
    message: String,
    user_id: Option<String>,
}

#[tauri::command]
async fn login_user(email: String, password: String) -> Result<AuthResponse, String> {
    // TODO: connect DB (np. Supabase, PostgreSQL)
    // let client = reqwest::Client::new();
    // let response = client.post("https://twoja-baza.supabase.co/auth/v1/token?grant_type=password")
    //     .json(&serde_json::json!({
    //         "email": email,
    //         "password": password
    //     }))
    //     .send()
    //     .await
    //     .map_err(|e| e.to_string())?;
    
    println!("Login attempt: email={}", email);
    
    if email == "test@test.com" && password == "password123" {
        Ok(AuthResponse {
            success: true,
            message: "Zalogowano pomyślnie".to_string(),
            user_id: Some("user_123".to_string()),
        })
    } else {
        Ok(AuthResponse {
            success: false,
            message: "Nieprawidłowe dane logowania".to_string(),
            user_id: None,
        })
    }
}

#[tauri::command]
async fn register_user(email: String, password: String, username: String) -> Result<AuthResponse, String> {
    // TODO: connect DB
    // Przykład dodania użytkownika do bazy:
    // let client = reqwest::Client::new();
    // let response = client.post("https://twoja-baza.supabase.co/auth/v1/signup")
    //     .json(&serde_json::json!({
    //         "email": email,
    //         "password": password,
    //         "data": { "username": username }
    //     }))
    //     .send()
    //     .await
    //     .map_err(|e| e.to_string())?;
    
    println!("Register attempt: email={}, username={}", email, username);
    
    // Mock response - zamień na prawdziwą logikę
    Ok(AuthResponse {
        success: true,
        message: format!("Konto {} zostało utworzone!", username),
        user_id: Some("new_user_456".to_string()),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![login_user, register_user])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
