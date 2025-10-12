use serde::Deserialize;
use serde_json::json;

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
            .map_err(|e| format!("Network error: {}", e))?;

        println!("📥 Response status: {}", response.status());

        if response.status().is_success() {
            let response_text = response
                .text()
                .await
                .map_err(|e| format!("Failed to read response: {}", e))?;

            println!("📋 Response body: {}", response_text);

            serde_json::from_str::<SupabaseAuthResponse>(&response_text)
                .map_err(|e| format!("Failed to parse response: {}", e))
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());

            if let Ok(error) = serde_json::from_str::<SupabaseError>(&error_text) {
                Err(error.error_description.unwrap_or(error.error))
            } else {
                Err(error_text)
            }
        }
    }

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
            .map_err(|e| format!("Network error: {}", e))?;

        println!("📥 Response status: {}", response.status());

        if response.status().is_success() {
            let response_text = response
                .text()
                .await
                .map_err(|e| format!("Failed to read response: {}", e))?;

            println!("📋 Response body: {}", response_text);

            serde_json::from_str::<SupabaseAuthResponse>(&response_text)
                .map_err(|e| format!("Failed to parse response: {}", e))
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());

            if let Ok(error) = serde_json::from_str::<SupabaseError>(&error_text) {
                Err(error.error_description.unwrap_or(error.error))
            } else {
                Err(error_text)
            }
        }
    }

    pub async fn sign_in_with_google(&self) -> Result<String, String> {
        let url = format!("{}/auth/v1/authorize?provider=google", self.url);
        Ok(url)
    }

    pub async fn get_user_profile_with_role(
        &self,
        access_token: &str,
    ) -> Result<serde_json::Value, String> {
        // First get the user ID from the token
        let url = format!("{}/auth/v1/user", self.url);

        let user_response = self
            .client
            .get(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await
            .map_err(|e| format!("Network error getting user: {}", e))?;

        if !user_response.status().is_success() {
            return Err("Failed to get user from token".to_string());
        }

        let user_data: serde_json::Value = user_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse user: {}", e))?;

        let user_id = user_data
            .get("id")
            .and_then(|id| id.as_str())
            .ok_or("No user ID in response")?;

        println!("📝 User ID from token: {}", user_id);

        // Now get the profile with role
        let profile_url = format!("{}/rest/v1/profiles?id=eq.{}&select=*", self.url, user_id);

        let profile_response = self
            .client
            .get(&profile_url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", access_token))
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|e| format!("Network error getting profile: {}", e))?;

        println!("📥 Profile response status: {}", profile_response.status());

        if profile_response.status().is_success() {
            let profile_text = profile_response
                .text()
                .await
                .map_err(|e| format!("Failed to read profile response: {}", e))?;

            println!("📋 Profile data: {}", profile_text);

            let profiles: Vec<serde_json::Value> = serde_json::from_str(&profile_text)
                .map_err(|e| format!("Failed to parse profile: {}", e))?;

            profiles
                .first()
                .cloned()
                .ok_or("No profile found".to_string())
        } else {
            let error_text = profile_response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            println!("❌ Profile error: {}", error_text);
            Err(error_text)
        }
    }

    pub async fn exchange_code_for_session(
        &self,
        code: &str,
    ) -> Result<SupabaseAuthResponse, String> {
        let url = format!("{}/auth/v1/token?grant_type=authorization_code", self.url);

        let body = json!({
            "auth_code": code
        });

        let response = self
            .client
            .post(&url)
            .header("apikey", &self.anon_key)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if response.status().is_success() {
            let response_text = response
                .text()
                .await
                .map_err(|e| format!("Failed to read response: {}", e))?;

            serde_json::from_str::<SupabaseAuthResponse>(&response_text)
                .map_err(|e| format!("Failed to parse response: {}", e))
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());

            if let Ok(error) = serde_json::from_str::<SupabaseError>(&error_text) {
                Err(error.error_description.unwrap_or(error.error))
            } else {
                Err(error_text)
            }
        }
    }

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

pub fn get_supabase_config() -> Result<(String, String), String> {
    let url = std::env::var("SUPABASE_URL")
        .map_err(|_| "SUPABASE_URL not set in environment".to_string())?;

    let anon_key = std::env::var("SUPABASE_ANON_KEY")
        .map_err(|_| "SUPABASE_ANON_KEY not set in environment".to_string())?;

    Ok((url, anon_key))
}
