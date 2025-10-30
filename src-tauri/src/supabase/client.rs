use reqwest::Client;
use serde::Deserialize;
use serde_json::{json, Value};

use super::types::{SupabaseAuthResponse, SupabaseError};

pub struct SupabaseClient {
    url: String,
    anon_key: String,
    client: Client,
}

#[allow(dead_code)]
impl SupabaseClient {
    pub fn new(url: String, anon_key: String) -> Self {
        Self {
            url,
            anon_key,
            client: Client::new(),
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

        println!("Attempting signup to: {}", url);
        println!(
            "Request body: {}",
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

        println!("Response status: {}", response.status());

        if response.status().is_success() {
            let response_text = response
                .text()
                .await
                .map_err(|e| format!("Failed to read response: {}", e))?;

            println!("Response body: {}", response_text);

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

        println!("Attempting login to: {}", url);
        println!(
            "Request body: {}",
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

    pub async fn get_user_profile_with_role(&self, access_token: &str) -> Result<Value, String> {
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

        let user_data: Value = user_response
            .json()
            .await
            .map_err(|e| format!("Failed to parse user: {}", e))?;

        let user_id = user_data
            .get("id")
            .and_then(|id| id.as_str())
            .ok_or("No user ID in response")?;

        println!("User ID from token: {}", user_id);

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

        println!("Profile response status: {}", profile_response.status());

        if profile_response.status().is_success() {
            let profile_text = profile_response
                .text()
                .await
                .map_err(|e| format!("Failed to read profile response: {}", e))?;

            println!("Profile data: {}", profile_text);

            let profiles: Vec<Value> = serde_json::from_str(&profile_text)
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
            println!("Profile error: {}", error_text);
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
    ) -> Result<Value, String> {
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
                .json::<Value>()
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

    pub async fn rest_request<T: for<'de> Deserialize<'de>>(
        &self,
        method: reqwest::Method,
        endpoint: &str,
        access_token: &str,
        body: Option<Value>,
    ) -> Result<T, String> {
        let url = format!("{}/rest/v1/{}", self.url, endpoint);

        let mut request = self
            .client
            .request(method, &url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", access_token))
            .header("Content-Type", "application/json");

        if body.is_some() {
            request = request.header("Prefer", "return=representation");
        }

        if let Some(json_body) = body {
            request = request.json(&json_body);
        }

        let response = request
            .send()
            .await
            .map_err(|e| format!("Network error: {}", e))?;

        if response.status().is_success() {
            if response.status() == reqwest::StatusCode::NO_CONTENT {
                serde_json::from_value(serde_json::Value::Null)
                    .map_err(|e| format!("Failed to parse empty response: {}", e))
            } else {
                response
                    .json()
                    .await
                    .map_err(|e| format!("Failed to parse response: {}", e))
            }
        } else {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            Err(error_text)
        }
    }
}
