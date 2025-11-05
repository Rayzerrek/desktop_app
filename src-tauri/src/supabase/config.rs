pub fn get_supabase_config() -> Result<(String, String), String> {
    #[cfg(debug_assertions)]
    {
        let url = std::env::var("SUPABASE_URL")
            .map_err(|_| "SUPABASE_URL not set in environment".to_string())?;
        let anon_key = std::env::var("SUPABASE_ANON_KEY")
            .map_err(|_| "SUPABASE_ANON_KEY not set in environment".to_string())?;
        Ok((url, anon_key))
    }

}
