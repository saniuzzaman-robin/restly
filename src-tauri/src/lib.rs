use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct NativeHeader {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NativeHttpRequest {
    pub url: String,
    pub method: String,
    pub headers: HashMap<String, String>,
    pub body: Option<String>,
    pub timeout_ms: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NativeHttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<NativeHeader>,
    pub raw_text: String,
    pub duration_ms: u64,
}

#[tauri::command]
async fn execute_native_http(req: NativeHttpRequest) -> Result<NativeHttpResponse, String> {
    let start = std::time::Instant::now();

    let client_builder = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .user_agent("PostmanRuntime/7.39.0");

    let timeout_ms = req.timeout_ms.unwrap_or(30000);
    let client = client_builder
        .timeout(std::time::Duration::from_millis(timeout_ms))
        .build()
        .map_err(|e| format!("Failed to build native HTTP client: {}", e))?;

    let method = req.method.parse::<reqwest::Method>()
        .map_err(|e| format!("Invalid HTTP method {}: {}", req.method, e))?;

    let mut request_builder = client.request(method, &req.url);

    for (k, v) in req.headers {
        let key_trim = k.trim();
        if !key_trim.is_empty() && key_trim.to_lowercase() != "host" {
            request_builder = request_builder.header(key_trim, v);
        }
    }

    if let Some(body_str) = req.body {
        if !body_str.is_empty() {
            request_builder = request_builder.body(body_str);
        }
    }

    let response = request_builder
        .send()
        .await
        .map_err(|e| format!("Native HTTP Request Failed: {}", e))?;

    let duration_ms = start.elapsed().as_millis() as u64;
    let status = response.status().as_u16();
    let status_text = response.status().canonical_reason().unwrap_or("").to_string();

    let mut res_headers = Vec::new();
    for (k, v) in response.headers() {
        if let Ok(val_str) = v.to_str() {
            res_headers.push(NativeHeader {
                key: k.as_str().to_string(),
                value: val_str.to_string(),
            });
        }
    }

    let raw_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    Ok(NativeHttpResponse {
        status,
        status_text,
        headers: res_headers,
        raw_text,
        duration_ms,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![execute_native_http])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::{execute_native_http, NativeHttpRequest};
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_staging_muslimpro_endpoint() {
        let mut headers = HashMap::new();
        headers.insert("Accept".to_string(), "application/json".to_string());

        let req = NativeHttpRequest {
            url: "https://api-mp.staging.muslimpro.com/v1/muslimpro/features/precalc/auto-settings".to_string(),
            method: "GET".to_string(),
            headers,
            body: None,
            timeout_ms: Some(10000),
        };

        let res = execute_native_http(req).await;
        println!("TEST_RESULT: {:?}", res);
        assert!(res.is_ok());
        let response = res.unwrap();
        println!("TEST_STATUS: {}", response.status);
        println!("TEST_RAW_TEXT: {}", response.raw_text);
    }
}
