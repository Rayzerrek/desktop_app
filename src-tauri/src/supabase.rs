use serde::Deserialize;
use serde_json::json;

// Supabase Auth Response structures
#[derive(Debug, Deserialize)]
pub struct SupabaseAuthResponse {
    pub access_token: Option<String>,
    pub token_type: Option<String>,
    pub expires_in: Option<i64>,
    pub refresh_token: Option<String>,
    pub user: SupabaseUser,
}

#[derive(Debug, Deserialize)]
pub struct SupabaseUser {
    pub id: String,
    pub email: Option<String>,
    pub user_metadata: Option<serde_json::Value>,
    pub confirmation_sent_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SupabaseError {
    pub error: String,
    pub error_description: Option<String>,
}

// Supabase Client
pub struct SupabaseClient {
    url: String,
    anon_key: String,
    client: reqwest::Client,
}

impl SupabaseClient {
    pub fn new(url: String, anon_key: String) -> Self {
        Self {
            url,
            anon_key,
            client: reqwest::Client::new(),
        }
    }

    // Sign up new user
    pub async fn sign_up(
        &self,
        email: &str,
        password: &str,
        username: &str,
    ) -> Result<SupabaseAuthResponse, String> {
        let url = format!("{}/auth/v1/signup", self.url);

        let body = json!({
            "email": email,
            "password": password,
            "data": {
                "username": username
            }
        });

        println!("📤 Attempting signup to: {}", url);
        println!(
            "📦 Request body: {}",
            serde_json::to_string_pretty(&body).unwrap_or_default()
        );

        let response = self
            .client
            .post(&url)
            .header("apikey", &self.anon_key)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                eprintln!("❌ Network error during signup: {:?}", e);
                format!("Network error: {}", e)
            })?;

        println!("📥 Response status: {}", response.status());

        if response.status().is_success() {
            let response_text = response
                .text()
                .await
                .map_err(|e| format!("Failed to read response: {}", e))?;

            println!("📋 Response body: {}", response_text);

            serde_json::from_str::<SupabaseAuthResponse>(&response_text).map_err(|e| {
                format!(
                    "Failed to parse response: {}. Body was: {}",
                    e, response_text
                )
            })
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());

            // Try to parse as SupabaseError
            if let Ok(error) = serde_json::from_str::<SupabaseError>(&error_text) {
                Err(error.error_description.unwrap_or(error.error))
            } else {
                Err(error_text)
            }
        }
    }

    // Sign in existing user
    pub async fn sign_in(
        &self,
        email: &str,
        password: &str,
    ) -> Result<SupabaseAuthResponse, String> {
        let url = format!("{}/auth/v1/token?grant_type=password", self.url);

        let body = json!({
            "email": email,
            "password": password
        });

        println!("📤 Attempting login to: {}", url);
        println!(
            "📦 Request body: {}",
            serde_json::to_string_pretty(&body).unwrap_or_default()
        );

        let response = self
            .client
            .post(&url)
            .header("apikey", &self.anon_key)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                eprintln!("❌ Network error during login: {:?}", e);
                format!("Network error: {}", e)
            })?;

        println!("📥 Response status: {}", response.status());

        if response.status().is_success() {
            let response_text = response
                .text()
                .await
                .map_err(|e| format!("Failed to read response: {}", e))?;

            println!("📋 Response body: {}", response_text);

            serde_json::from_str::<SupabaseAuthResponse>(&response_text).map_err(|e| {
                format!(
                    "Failed to parse response: {}. Body was: {}",
                    e, response_text
                )
            })
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());

            // Try to parse as SupabaseError
            if let Ok(error) = serde_json::from_str::<SupabaseError>(&error_text) {
                Err(error.error_description.unwrap_or(error.error))
            } else {
                Err(error_text)
            }
        }
    }

    // Get user profile from database
    pub async fn get_user_profile(
        &self,
        user_id: &str,
        access_token: &str,
    ) -> Result<serde_json::Value, String> {
        let url = format!("{}/rest/v1/profiles?id=eq.{}&select=*", self.url, user_id);

        let response = self
            .client
            .get(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", access_token))
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if response.status().is_success() {
            response
                .json::<serde_json::Value>()
                .await
                .map_err(|e| format!("Failed to parse response: {}", e))
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            Err(error_text)
        }
    }

    // Sign out user
    pub async fn sign_out(&self, access_token: &str) -> Result<(), String> {
        let url = format!("{}/auth/v1/logout", self.url);

        let response = self
            .client
            .post(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if response.status().is_success() {
            Ok(())
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            Err(error_text)
        }
    }
}

// Helper function to load environment variables
pub fn get_supabase_config() -> Result<(String, String), String> {
    // For Tauri, we'll use tauri::api::path to get the resource directory
    // But for now, we'll use environment variables that should be set at compile time

    // In production, you might want to bundle these in tauri.conf.json or use a config file
    let url = std::env::var("SUPABASE_URL").map_err(|_| {
        eprintln!("❌ SUPABASE_URL not found in environment variables");
        eprintln!("💡 Make sure your .env file exists and contains SUPABASE_URL");
        "SUPABASE_URL not set in environment".to_string()
    })?;

    let anon_key = std::env::var("SUPABASE_ANON_KEY").map_err(|_| {
        eprintln!("❌ SUPABASE_ANON_KEY not found in environment variables");
        eprintln!("💡 Make sure your .env file exists and contains SUPABASE_ANON_KEY");
        "SUPABASE_ANON_KEY not set in environment".to_string()
    })?;

    println!("✅ Supabase config loaded");
    println!("   URL: {}", url);
    println!(
        "   Key: {}...",
        &anon_key.chars().take(20).collect::<String>()
    );

    Ok((url, anon_key))
}
