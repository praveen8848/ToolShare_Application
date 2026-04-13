package com.toolsharing.tool_service.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate;

    public GeocodingService() {
        this.restTemplate = new RestTemplate();
    }

    public double[] getCoordinatesForAddress(String address) {
        // THE FIX: Use a URI template variable {address} so RestTemplate securely URL-encodes the spaces/commas itself.
        String url = "https://nominatim.openstreetmap.org/search?q={address}&format=json&limit=1";

        HttpHeaders headers = new HttpHeaders();
        // IMPORTANT: Keep your real email in this string, or the 403 Forbidden error will return!
        headers.set("User-Agent", "ToolSharingPlatform_BTechProject/1.0 (put_your_real_email_here@gmail.com)");
        headers.set("Accept-Language", "en-US,en;q=0.9");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // We pass 'address' as the final argument. Spring safely injects it into the {address} block.
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class, address);
            List<Map<String, Object>> responseBody = response.getBody();

            if (responseBody != null && !responseBody.isEmpty()) {
                Map<String, Object> location = responseBody.get(0);

                double lat = Double.parseDouble(location.get("lat").toString());
                double lon = Double.parseDouble(location.get("lon").toString());

                return new double[]{lat, lon};
            } else {
                System.out.println("Geocoding Warning: OpenStreetMap returned 0 results for address: '" + address + "'");
            }
        } catch (Exception e) {
            System.err.println("Geocoding API Error for address: " + address + " | Error: " + e.getMessage());
        }

        return null;
    }
}