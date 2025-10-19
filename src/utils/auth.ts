export type Tokens = {access_token?:string, refresh_token?:string, user_id?:string};

export function saveAuthTokens(tokens:Tokens){
    if(tokens.access_token){
        localStorage.setItem("access_token", tokens.access_token);
    }
    if(tokens.refresh_token){
        localStorage.setItem("refresh_token", tokens.refresh_token);
    }
    if(tokens.user_id){
        localStorage.setItem("user_id", tokens.user_id);
    }
}

export function clearAuthTokens(){
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
}
export function isAuthenticated():boolean{
    return !!localStorage.getItem("access_token");
}