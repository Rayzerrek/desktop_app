use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Deserialize)]
pub struct SupabaseAuthResponse {
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub user: SupabaseUser,
}

#[derive(Debug, Deserialize)]
pub struct SupabaseUser {
    pub id: String,
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

#[allow(dead_code)]
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

    pub async fn get_user_profile_with_role(
        &self,
        access_token: &str,
    ) -> Result<serde_json::Value, String> {
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

//============================================
// DATA STRUCTURES FOR LESSONS/COURSES
//============================================

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub struct Course {
    pub id: String,
    pub title: String,
    pub description: String,
    pub difficulty: String,
    pub language: String,
    pub modules: Vec<Module>,
    pub color: String,
    pub order_index: i32,
    pub is_published: bool,
    pub estimated_hours: Option<i32>,
    pub icon_url: Option<String>,
}

// Raw course data from database (without nested modules)
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub struct CourseRow {
    pub id: String,
    pub title: String,
    pub description: String,
    pub difficulty: String,
    pub language: String,
    pub color: String,
    pub order_index: i32,
    pub is_published: bool,
    pub estimated_hours: Option<i32>,
    pub icon_url: Option<String>,
}

// For creating courses (no id/modules required)
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCourseInput {
    pub title: String,
    pub description: String,
    pub difficulty: String,
    pub language: String,
    pub color: String,
    pub order_index: i32,
    #[serde(alias = "isPublished")]
    pub is_published: bool,
    #[serde(alias = "estimatedHours")]
    pub estimated_hours: Option<i32>,
    #[serde(alias = "iconUrl")]
    pub icon_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub struct Module {
    pub id: String,
    pub course_id: String,
    pub title: String,
    pub description: String,
    pub lessons: Vec<Lesson>,
    pub order_index: i32,
    pub icon_emoji: Option<String>,
}

// Raw module data from database (without nested lessons)
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub struct ModuleRow {
    pub id: String,
    pub course_id: String,
    pub title: String,
    pub description: String,
    pub order_index: i32,
    pub icon_emoji: Option<String>,
}

// For creating modules (no id/lessons required)
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateModuleInput {
    pub course_id: String,
    pub title: String,
    pub description: String,
    pub order_index: i32,
    #[serde(alias = "iconEmoji")]
    pub icon_emoji: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub struct Lesson {
    pub id: String,
    pub module_id: String,
    pub title: String,
    pub lesson_type: String,
    pub content: serde_json::Value,
    pub xp_reward: i32,
    pub order_index: i32,
    pub is_locked: bool,
    pub description: Option<String>,
    pub language: String,
    pub estimated_minutes: Option<i32>,
}

// For creating lessons (no id required)
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLessonInput {
    pub module_id: String,
    pub title: String,
    #[serde(alias = "lessonType")]
    pub lesson_type: String,
    pub content: serde_json::Value,
    #[serde(alias = "xpReward")]
    pub xp_reward: i32,
    #[serde(alias = "orderIndex")]
    pub order_index: i32,
    #[serde(alias = "isLocked")]
    pub is_locked: bool,
    pub description: Option<String>,
    pub language: String,
    #[serde(alias = "estimatedMinutes")]
    pub estimated_minutes: Option<i32>,
}

//============================================
// TAURI COMMANDS FOR COURSES/MODULES/LESSONS
//============================================

fn get_supabase_client() -> Result<SupabaseClient, String> {
    let (url, anon_key) = get_supabase_config()?;
    Ok(SupabaseClient::new(url, anon_key))
}

#[tauri::command]
pub async fn get_all_courses(access_token: String) -> Result<Vec<Course>, String> {
    let client = get_supabase_client()?;
    
    let url = format!(
        "{}/rest/v1/courses?select=*,modules(*,lessons(*))&is_published=eq.true&order=order_index",
        client.url
    );

    let response = client.client
        .get(&url)
        .header("apikey", &client.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status().is_success() {
        let courses: Vec<Course> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse courses: {}", e))?;
        Ok(courses)
    } else {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        Err(format!("Supabase error: {}", error_text))
    }
}

#[tauri::command]
pub async fn get_lesson_by_id(lesson_id: String, access_token: String) -> Result<Lesson, String> {
    let client = get_supabase_client()?;
    
    let url = format!(
        "{}/rest/v1/lessons?select=*&id=eq.{}",
        client.url, lesson_id
    );

    let response = client.client
        .get(&url)
        .header("apikey", &client.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status().is_success() {
        let lessons: Vec<Lesson> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse lesson: {}", e))?;

        lessons
            .into_iter()
            .next()
            .ok_or_else(|| format!("Lesson {} not found", lesson_id))
    } else {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        Err(format!("Supabase error: {}", error_text))
    }
}

#[tauri::command]
pub async fn create_course(course: CreateCourseInput, access_token: String) -> Result<Course, String> {
    let client = get_supabase_client()?;
    
    let url = format!("{}/rest/v1/courses", client.url);

    let body = json!({
        "title": course.title,
        "description": course.description,
        "difficulty": course.difficulty,
        "language": course.language,
        "color": course.color,
        "order_index": course.order_index,
        "is_published": course.is_published,
        "estimated_hours": course.estimated_hours,
        "icon_url": course.icon_url,
    });

    let response = client.client
        .post(&url)
        .header("apikey", &client.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status().is_success() {
        let course_rows: Vec<CourseRow> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        let course_row = course_rows
            .into_iter()
            .next()
            .ok_or_else(|| "No course returned".to_string())?;

        // Convert CourseRow to Course with empty modules
        Ok(Course {
            id: course_row.id,
            title: course_row.title,
            description: course_row.description,
            difficulty: course_row.difficulty,
            language: course_row.language,
            modules: Vec::new(), // Empty initially
            color: course_row.color,
            order_index: course_row.order_index,
            is_published: course_row.is_published,
            estimated_hours: course_row.estimated_hours,
            icon_url: course_row.icon_url,
        })
    } else {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        Err(format!("Failed to create course: {}", error_text))
    }
}

#[tauri::command]
pub async fn create_module(module: CreateModuleInput, access_token: String) -> Result<Module, String> {
    let client = get_supabase_client()?;
    
    let url = format!("{}/rest/v1/modules", client.url);

    let body = json!({
        "course_id": module.course_id,
        "title": module.title,
        "description": module.description,
        "order_index": module.order_index,
        "icon_emoji": module.icon_emoji,
    });

    let response = client.client
        .post(&url)
        .header("apikey", &client.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status().is_success() {
        let module_rows: Vec<ModuleRow> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        let module_row = module_rows
            .into_iter()
            .next()
            .ok_or_else(|| "No module returned".to_string())?;

        // Convert ModuleRow to Module with empty lessons
        Ok(Module {
            id: module_row.id,
            course_id: module_row.course_id,
            title: module_row.title,
            description: module_row.description,
            lessons: Vec::new(), // Empty initially
            order_index: module_row.order_index,
            icon_emoji: module_row.icon_emoji,
        })
    } else {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        Err(format!("Failed to create module: {}", error_text))
    }
}

#[tauri::command]
pub async fn create_lesson(lesson: CreateLessonInput, access_token: String) -> Result<Lesson, String> {
    let client = get_supabase_client()?;
    
    let url = format!("{}/rest/v1/lessons", client.url);

    let body = json!({
        "module_id": lesson.module_id,
        "title": lesson.title,
        "lesson_type": lesson.lesson_type,
        "content": lesson.content,
        "xp_reward": lesson.xp_reward,
        "order_index": lesson.order_index,
        "is_locked": lesson.is_locked,
        "description": lesson.description,
        "language": lesson.language,
        "estimated_minutes": lesson.estimated_minutes,
    });

    let response = client.client
        .post(&url)
        .header("apikey", &client.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status().is_success() {
        let lessons: Vec<Lesson> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        lessons
            .into_iter()
            .next()
            .ok_or_else(|| "No lesson returned".to_string())
    } else {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        Err(format!("Failed to create lesson: {}", error_text))
    }
}

#[tauri::command]
pub async fn update_lesson(
    lesson_id: String,
    updates: serde_json::Value,
    access_token: String,
) -> Result<Lesson, String> {
    let client = get_supabase_client()?;
    
    let url = format!("{}/rest/v1/lessons?id=eq.{}", client.url, lesson_id);

    let response = client.client
        .patch(&url)
        .header("apikey", &client.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&updates)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status().is_success() {
        let lessons: Vec<Lesson> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        lessons
            .into_iter()
            .next()
            .ok_or_else(|| "No lesson returned".to_string())
    } else {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        Err(format!("Failed to update lesson: {}", error_text))
    }
}

#[tauri::command]
pub async fn delete_lesson(lesson_id: String, access_token: String) -> Result<(), String> {
    let client = get_supabase_client()?;
    
    let url = format!("{}/rest/v1/lessons?id=eq.{}", client.url, lesson_id);

    let response = client.client
        .delete(&url)
        .header("apikey", &client.anon_key)
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
        Err(format!("Failed to delete lesson: {}", error_text))
    }
}
