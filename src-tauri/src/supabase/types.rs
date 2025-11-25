use serde::{Deserialize, Serialize};
use serde_json::Value;

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

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    #[serde(rename = "type")]
    pub result_type: String,
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    #[serde(rename = "courseName")]
    pub course_name: Option<String>,
    #[serde(rename = "moduleName")]
    pub module_name: Option<String>,
}

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
    pub content: Value,
    pub xp_reward: i32,
    pub order_index: i32,
    pub is_locked: bool,
    pub description: Option<String>,
    pub language: String,
    pub estimated_minutes: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLessonInput {
    pub module_id: String,
    pub title: String,
    #[serde(alias = "lessonType")]
    pub lesson_type: String,
    pub content: Value,
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProgress {
    pub id: Option<String>,
    pub user_id: String,
    pub lesson_id: String,
    pub status: String,
    pub score: Option<i32>,
    pub attempts: i32,
    pub completed_at: Option<String>,
    pub time_spent_seconds: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProgressInput {
    pub user_id: String,
    pub lesson_id: String,
    pub status: String,
    pub score: Option<i32>,
    pub attempts: i32,
    pub completed_at: Option<String>,
    pub time_spent_seconds: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserProfile {
    pub id: String,
    pub email: Option<String>,
    pub username: Option<String>,
    pub avatar_url: Option<String>,
    pub total_xp: Option<i32>,
    pub level:Option<i32>,
    
}