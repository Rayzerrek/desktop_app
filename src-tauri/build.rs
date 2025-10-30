fn main() {
    #[cfg(not(debug_assertions))]
    {
        let mut loaded = false;
        for candidate in [".env.production"] {
            if dotenvy::from_filename(candidate).is_ok() {
                loaded = true;
                break;
            }
        }

        if loaded {
            if let Ok(url) = std::env::var("SUPABASE_URL") {
                println!("cargo:rustc-env=SUPABASE_URL={}", url);
            }
            if let Ok(key) = std::env::var("SUPABASE_ANON_KEY") {
                println!("cargo:rustc-env=SUPABASE_ANON_KEY={}", key);
            }
        } else {
            println!("cargo:warning=.env.production not found, using system environment variables");
        }
    }

    #[cfg(debug_assertions)]
    {
        dotenvy::dotenv().ok();
    }

    tauri_build::build()
}
