// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn add_numbers(a:i32, b:i32) -> i32 {
    a + b
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![add_numbers])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
