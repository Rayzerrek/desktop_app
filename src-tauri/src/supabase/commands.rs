use reqwest::Method;
use serde_json::{json, Value};

use crate::supabase::types::UserProfile;

use super::{
    client::SupabaseClient,
    config::get_supabase_config,
    types::{
        Course, CourseRow, CreateCourseInput, CreateLessonInput, CreateModuleInput,
        CreateProgressInput, Lesson, Module, ModuleRow, SearchResult, UserProgress,
    },
};

fn get_supabase_client() -> Result<SupabaseClient, String> {
    let (url, anon_key) = get_supabase_config()?;
    Ok(SupabaseClient::new(url, anon_key))
}

#[tauri::command]
pub async fn get_all_courses(access_token: String) -> Result<Vec<Course>, String> {
    let client = get_supabase_client()?;
    client
        .rest_request(
            Method::GET,
            "courses?select=*,modules(*,lessons(*))&is_published=eq.true&order=order_index",
            &access_token,
            None,
        )
        .await
}

#[tauri::command]
pub async fn get_lesson_by_id(lesson_id: String, access_token: String) -> Result<Lesson, String> {
    let client = get_supabase_client()?;
    let lessons: Vec<Lesson> = client
        .rest_request(
            Method::GET,
            &format!("lessons?select=*&id=eq.{}", lesson_id),
            &access_token,
            None,
        )
        .await?;

    lessons
        .into_iter()
        .next()
        .ok_or_else(|| format!("Lesson {} not found", lesson_id))
}

#[tauri::command]
pub async fn create_course(
    course: CreateCourseInput,
    access_token: String,
) -> Result<Course, String> {
    let client = get_supabase_client()?;

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

    let course_rows: Vec<CourseRow> = client
        .rest_request(Method::POST, "courses", &access_token, Some(body))
        .await?;

    let course_row = course_rows
        .into_iter()
        .next()
        .ok_or_else(|| "No course returned".to_string())?;

    Ok(Course {
        id: course_row.id,
        title: course_row.title,
        description: course_row.description,
        difficulty: course_row.difficulty,
        language: course_row.language,
        modules: Vec::new(),
        color: course_row.color,
        order_index: course_row.order_index,
        is_published: course_row.is_published,
        estimated_hours: course_row.estimated_hours,
        icon_url: course_row.icon_url,
    })
}

#[tauri::command]
pub async fn create_module(
    module: CreateModuleInput,
    access_token: String,
) -> Result<Module, String> {
    let client = get_supabase_client()?;

    let body = json!({
        "course_id": module.course_id,
        "title": module.title,
        "description": module.description,
        "order_index": module.order_index,
        "icon_emoji": module.icon_emoji,
    });

    let module_rows: Vec<ModuleRow> = client
        .rest_request(Method::POST, "modules", &access_token, Some(body))
        .await?;

    let module_row = module_rows
        .into_iter()
        .next()
        .ok_or_else(|| "No module returned".to_string())?;

    Ok(Module {
        id: module_row.id,
        course_id: module_row.course_id,
        title: module_row.title,
        description: module_row.description,
        lessons: Vec::new(),
        order_index: module_row.order_index,
        icon_emoji: module_row.icon_emoji,
    })
}

#[tauri::command]
pub async fn create_lesson(
    lesson: CreateLessonInput,
    access_token: String,
) -> Result<Lesson, String> {
    let client = get_supabase_client()?;

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

    let lessons: Vec<Lesson> = client
        .rest_request(Method::POST, "lessons", &access_token, Some(body))
        .await?;

    lessons
        .into_iter()
        .next()
        .ok_or_else(|| "No lesson returned".to_string())
}

#[tauri::command]
pub async fn update_lesson(
    lesson_id: String,
    updates: Value,
    access_token: String,
) -> Result<Lesson, String> {
    let client = get_supabase_client()?;

    let lessons: Vec<Lesson> = client
        .rest_request(
            Method::PATCH,
            &format!("lessons?id=eq.{}", lesson_id),
            &access_token,
            Some(updates),
        )
        .await?;

    lessons
        .into_iter()
        .next()
        .ok_or_else(|| "No lesson returned".to_string())
}

#[tauri::command]
pub async fn delete_lesson(lesson_id: String, access_token: String) -> Result<(), String> {
    let client = get_supabase_client()?;
    let _: Option<Value> = client
        .rest_request(
            Method::DELETE,
            &format!("lessons?id=eq.{}", lesson_id),
            &access_token,
            None,
        )
        .await?;
    Ok(())
}

#[tauri::command]
pub async fn delete_course(course_id: String, access_token: String) -> Result<(), String> {
    let client = get_supabase_client()?;
    let _: Option<Value> = client
        .rest_request(
            Method::DELETE,
            &format!("courses?id=eq.{}", course_id),
            &access_token,
            None,
        )
        .await?;
    Ok(())
}

#[tauri::command]
pub async fn search_lessons(
    query: String,
    access_token: String,
) -> Result<Vec<SearchResult>, String> {
    let client = get_supabase_client()?;

    let encoded_query = urlencoding::encode(&query);

    let courses_endpoint = format!(
        "courses?select=id,title,description&or=(title.ilike.*{}*,description.ilike.*{}*)&is_published=eq.true&limit=5",
        encoded_query,
        encoded_query
    );

    let courses: Vec<CourseRow> = client
        .rest_request(Method::GET, &courses_endpoint, &access_token, None)
        .await
        .unwrap_or_default();

    let lessons_endpoint = format!(
        "lessons?select=id,title,description,language,module_id,modules(title,course_id,courses(title))&or=(title.ilike.*{}*,description.ilike.*{}*)&limit=10",
        encoded_query,
        encoded_query
    );

    let lessons_response: Result<Vec<Value>, String> = client
        .rest_request(Method::GET, &lessons_endpoint, &access_token, None)
        .await;

    let mut results = Vec::new();

    for course in courses {
        results.push(SearchResult {
            result_type: "course".to_string(),
            id: course.id,
            title: course.title,
            description: Some(course.description),
            course_name: None,
            module_name: None,
        });
    }

    if let Ok(lessons) = lessons_response {
        for lesson in lessons {
            let id = lesson
                .get("id")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let title = lesson
                .get("title")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let description = lesson
                .get("description")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());

            let module_name = lesson
                .get("modules")
                .and_then(|m| m.get("title"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());

            let course_name = lesson
                .get("modules")
                .and_then(|m| m.get("courses"))
                .and_then(|c| c.get("title"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());

            results.push(SearchResult {
                result_type: "lesson".to_string(),
                id,
                title,
                description,
                course_name,
                module_name,
            });
        }
    }

    Ok(results)
}

#[tauri::command]
pub async fn get_user_progress(
    user_id: String,
    access_token: String,
) -> Result<Vec<UserProgress>, String> {
    let client = get_supabase_client()?;

    let endpoint = format!("user_progress?select=*&user_id=eq.{}", user_id);

    client
        .rest_request(Method::GET, &endpoint, &access_token, None)
        .await
}

#[tauri::command]
pub async fn update_lesson_progress(
    progress: CreateProgressInput,
    access_token: String,
) -> Result<UserProgress, String> {
    let client = get_supabase_client()?;

    let existing: Vec<UserProgress> = client
        .rest_request(
            Method::GET,
            &format!(
                "user_progress?select=*&user_id=eq.{}&lesson_id=eq.{}",
                progress.user_id, progress.lesson_id
            ),
            &access_token,
            None,
        )
        .await
        .unwrap_or_default();

    if let Some(existing_progress) = existing.first() {
        let body = json!({
            "status": progress.status,
            "score": progress.score,
            "attempts": progress.attempts,
            "completed_at": progress.completed_at,
            "time_spent_seconds": progress.time_spent_seconds,
        });

        let updated: Vec<UserProgress> = client
            .rest_request(
                Method::PATCH,
                &format!(
                    "user_progress?id=eq.{}",
                    existing_progress.id.as_ref().unwrap()
                ),
                &access_token,
                Some(body),
            )
            .await?;

        updated
            .into_iter()
            .next()
            .ok_or_else(|| "Failed to update progress".to_string())
    } else {
        let body = json!({
            "user_id": progress.user_id,
            "lesson_id": progress.lesson_id,
            "status": progress.status,
            "score": progress.score,
            "attempts": progress.attempts,
            "completed_at": progress.completed_at,
            "time_spent_seconds": progress.time_spent_seconds,
        });

        let created: Vec<UserProgress> = client
            .rest_request(Method::POST, "user_progress", &access_token, Some(body))
            .await?;

        created
            .into_iter()
            .next()
            .ok_or_else(|| "Failed to create progress".to_string())
    }
}

#[tauri::command]
pub async fn get_user_profile(user_id: String, access_token: String) -> Result<UserProfile, String> {
    let client = get_supabase_client()?;

    let endpoint = format!("profiles?select=*&id=eq.{}", user_id);
    let profiles: Vec<UserProfile> = client
        .rest_request(Method::GET, &endpoint, &access_token, None)
        .await?;

    let mut profile = profiles
        .into_iter()
        .next()
        .ok_or_else(|| "Profile not found".to_string())?;

    let completed_lessons: Vec<Value> = client
        .rest_request(
            Method::GET,
            &format!(
                "user_progress?select=lesson_id,lessons(xp_reward)&user_id=eq.{}&status=eq.completed",
                user_id
            ),
            &access_token,
            None,
        )
        .await
        .unwrap_or_default();

    let total_xp: i32 = completed_lessons
        .iter()
        .filter_map(|progress| {
            progress.get("lessons")
                .and_then(|l| l.get("xp_reward"))
                .and_then(|xp| xp.as_i64())
                .map(|xp| xp as i32)
        })
        .sum();

    let level = (total_xp / 1000) + 1;

    profile.total_xp = Some(total_xp);
    profile.level = Some(level);

    Ok(profile)
}

#[tauri::command]
pub async fn get_user_statistics(user_id: String, access_token: String) -> Result<Value, String> {
    let client = get_supabase_client()?;

    let completed_lessons: Vec<UserProgress> = client
        .rest_request(
            Method::GET,
            &format!(
                "user_progress?select=*&user_id=eq.{}&status=eq.completed",
                user_id
            ),
            &access_token,
            None,
        )
        .await
        .unwrap_or_default();

    let total_lessons_completed = completed_lessons.len();
    let total_minutes_spent: i32 = completed_lessons
        .iter()
        .filter_map(|p| p.time_spent_seconds)
        .sum::<i32>()
        / 60;


    Ok(json!({
        "total_lessons_completed": total_lessons_completed,
        "total_courses_completed": 0, // TODO: implement course completion logic
        "total_minutes_spent": total_minutes_spent,
    }))
}

#[tauri::command]
pub async fn get_user_achievements(
    user_id: String,
    access_token: String,
) -> Result<Vec<Value>, String> {
    let client = get_supabase_client()?;

    let endpoint = format!(
        "user_achievements?select=*,achievements(*)&user_id=eq.{}",
        user_id
    );

    client
        .rest_request(Method::GET, &endpoint, &access_token, None)
        .await
}

#[tauri::command]
pub async fn get_available_achievements(access_token: String) -> Result<Vec<Value>, String> {
    let client = get_supabase_client()?;

    client
        .rest_request(Method::GET, "achievements?select=*", &access_token, None)
        .await
}

#[tauri::command]
pub async fn update_user_avatar(
    user_id: String,
    avatar_url: String,
    access_token: String,
) -> Result<(), String> {
    let client = get_supabase_client()?;

    let body = json!({
        "avatar_url": avatar_url,
    });

    let _: Vec<Value> = client
        .rest_request(
            Method::PATCH,
            &format!("profiles?id=eq.{}", user_id),
            &access_token,
            Some(body),
        )
        .await?;

    Ok(())
}

#[tauri::command]
pub async fn update_user_username(
    user_id: String,
    username: String,
    access_token: String,
) -> Result<(), String> {
    let client = get_supabase_client()?;

    let body = json!({
        "username": username,
    });

    let _: Vec<Value> = client
        .rest_request(
            Method::PATCH,
            &format!("profiles?id=eq.{}", user_id),
            &access_token,
            Some(body),
        )
        .await?;

    Ok(())
}
