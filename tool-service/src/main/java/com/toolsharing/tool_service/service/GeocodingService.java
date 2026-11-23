package com.toolsharing.tool_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Service for geocoding addresses into latitude and longitude coordinates
 * using the OpenStreetMap Nominatim API.
 */
@Service
public class GeocodingService {

    private static final Logger logger = LoggerFactory.getLogger(GeocodingService.class);

    private final RestTemplate restTemplate;

    @Value("${geocoding.email:support@toolsharing.com}")
    private String geocodingEmail;

    public GeocodingService() {
        this.restTemplate = new RestTemplate();
    }

    public GeocodingService(RestTemplate restTemplate, String geocodingEmail) {
        this.restTemplate = restTemplate;
        this.geocodingEmail = geocodingEmail;
    }

    /**
     * Resolves geographical coordinates for a given address.
     *
     * @param address The human-readable address query
     * @return double array containing [latitude, longitude], or null if geocoding fails
     */
    @SuppressWarnings("rawtypes")
    public double[] getCoordinatesForAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            logger.warn("Geocoding requested with empty address");
            return null;
        }

        String url = "https://nominatim.openstreetmap.org/search?q={address}&format=json&limit=1";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "ToolSharingPlatform/1.0 (" + geocodingEmail + ")");
        headers.set("Accept-Language", "en-US,en;q=0.9");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class, address);

            if (response != null && response.getBody() != null && !response.getBody().isEmpty()) {
                Object firstItem = response.getBody().get(0);
                if (firstItem instanceof Map mapLocation) {
                    Object latObj = mapLocation.get("lat");
                    Object lonObj = mapLocation.get("lon");
                    if (latObj != null && lonObj != null) {
                        double lat = Double.parseDouble(latObj.toString());
                        double lon = Double.parseDouble(lonObj.toString());
                        return new double[]{lat, lon};
                    }
                }
            } else {
                logger.info("OpenStreetMap returned 0 results for address: '{}'", address);
            }
        } catch (Exception e) {
            logger.error("Geocoding API error for address '{}': {}", address, e.getMessage());
        }

        return null;
    }
}