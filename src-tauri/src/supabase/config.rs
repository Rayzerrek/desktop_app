pub fn get_supabase_config() -> Result<(String, String), String> {
    #[cfg(debug_assertions)]
    {
        let url = std::env::var("SUPABASE_URL")
            .map_err(|_| "SUPABASE_URL not set in environment".to_string())?;
        let anon_key = std::env::var("SUPABASE_ANON_KEY")
            .map_err(|_| "SUPABASE_ANON_KEY not set in environment".to_string())?;
        Ok((url, anon_key))
    }

    #[cfg(not(debug_assertions))]
    {
        let url = env!("SUPABASE_URL", "SUPABASE_URL must be set at compile time");
        let anon_key = env!(
            "SUPABASE_ANON_KEY",
            "SUPABASE_ANON_KEY must be set at compile time"
        );
        Ok((url.to_string(), anon_key.to_string()))
    }
}
