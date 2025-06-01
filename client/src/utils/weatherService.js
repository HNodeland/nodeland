// client/src/utils/weatherService.js

import { useState, useEffect } from 'react';

export function parseRaw(raw) {
  const parts = raw.trim().split(/\s+/);
  return {
    timestamp:                   Date.now(),                     // (ms)   | Unix‐ms when this parsing occurs
    station_id:                  parseFloat(parts[0]),           // –      | Unique ID for this weather station
    wind_speed:                  parseFloat(parts[1]),           // m/s    | Current instantaneous wind speed
    wind_gust:                   parseFloat(parts[2]),           // m/s    | Current instantaneous wind gust (peak over last 2.5 s)
    wind_dir:                    parseFloat(parts[3]),           // °      | Wind direction (0 = N, 90 = E, etc.)
    out_temp:                    parseFloat(parts[4]),           // °C     | Outdoor air temperature (radiation‐shielded TMP/HUM sensor)
    out_hum:                     parseFloat(parts[5]),           // %      | Outdoor relative humidity
    barometer:                   parseFloat(parts[6]),           // hPa    | Sea‐level‐corrected barometric pressure
    day_rain:                    parseFloat(parts[7]),           // mm     | Rain since 00:00 local time (tipping‐bucket)
    radiation:                   parseFloat(parts[8]),           // W/m²   | Global solar radiation
    uvIndex_raw:                 parseFloat(parts[9]),           // –      | Raw UV sensor output (divide by ∼32 to get real UVI)
    rain_last_hour:              parseFloat(parts[10]),          // mm     | Rainfall in last 60 minutes
    rain_last_24h:               parseFloat(parts[11]),          // mm     | Rainfall in last 24 hours
    in_temp:                     parseFloat(parts[12]),          // °C     | Indoor air temperature (console’s internal sensor)
    in_hum:                      parseFloat(parts[13]),          // %      | Indoor relative humidity
    battery_level:               parseFloat(parts[14]),          // %      | Console/battery status (100 = full)
    forecast_icon_code:          parseInt(parts[15], 10),        // ∈[0–4] | Numeric code for console forecast icon
    heat_index:                  parseFloat(parts[16]),          // °C     | Heat index (“feels like”)
    wind_chill:                  parseFloat(parts[17]),          // °C     | Wind chill (“feels like”)
    thsw_index:                  parseFloat(parts[18]),          // °C     | THSW index (temp‐hum‐sun‐wind comfort)
    dew_point:                   parseFloat(parts[19]),          // °C     | Dew point (computed from T & RH)
    yesterday_max_temp:          parseFloat(parts[20]),          // °C     | Yesterday’s maximum outdoor temp
    yesterday_min_temp:          parseFloat(parts[21]),          // °C     | Yesterday’s minimum outdoor temp
    yesterday_max_hum:           parseFloat(parts[22]),          // % or sentinel | Yesterday’s max RH (−100 = no data)
    yesterday_min_hum:           parseFloat(parts[23]),          // % or sentinel | Yesterday’s min RH
    yesterday_max_pressure:      parseFloat(parts[24]),          // hPa or sentinel| Yesterday’s max barometric pressure
    yesterday_min_pressure:      parseFloat(parts[25]),          // hPa or sentinel| Yesterday’s min barometric pressure
    yesterday_max_solar:         parseFloat(parts[26]),          // W/m² or sentinel| Yesterday’s max solar radiation
    yesterday_min_solar:         parseFloat(parts[27]),          // W/m² or sentinel| Yesterday’s min solar radiation
    yesterday_max_uv:            parseFloat(parts[28]),          // (×10) or sentinel  | Yesterday’s max UV (×10)
    measurement_hour:            parseInt(parts[29], 10),        // 0–23    | Hour of the timestamp
    measurement_minute:          parseInt(parts[30], 10),        // 0–59    | Minute of the timestamp
    measurement_second:          parseInt(parts[31], 10),        // 0–59    | Second of the timestamp
    location_label:              parts[32],                      // string  | “Været_i_Fjellhammervegen,_Harestua‐HH:MM:SS”
    sensor_flags:                parseInt(parts[33], 10),        // bitmask | Sensor status flags (0 = OK)
    communication_status:        parseInt(parts[34], 10),        // int     | Communication/link status (0 = normal)
    receiver_temp:               parseFloat(parts[35]),          // °C     | Console electronics‐compartment temperature
    receiver_hum:                parseFloat(parts[36]),          // %      | Console electronics‐compartment RH
    storm_rain:                  parseFloat(parts[37]),          // mm     | Rainfall in current storm
    rain_rate_10min:             parseFloat(parts[38]),          // mm/hr  | Avg. rain rate over last 10 minutes
    sunrise_flag:                parseInt(parts[39], 10),        // 0/100  | Sun above horizon flag (100 = “on”)
    sunset_flag:                 parseInt(parts[40], 10),        // 0/100  | Sun below horizon flag (100 = “on”)
    light_percent:               parseInt(parts[41], 10),        // %      | Ambient light % of full scale
    uv_percent:                  parseInt(parts[42], 10),        // %      | UV intensity % of full scale
    max_temp_today:              parseFloat(parts[43]),          // °C     | Today’s highest outdoor temp so far
    min_temp_today:              parseFloat(parts[44]),          // °C     | Today’s lowest outdoor temp so far
    max_temp_1h:                 parseFloat(parts[45]),          // °C     | Max outdoor temp in last hour
    min_temp_1h:                 parseFloat(parts[46]),          // °C     | Min outdoor temp in last hour
    humid_index_today:           parseFloat(parts[47]),          // unitless| Humidity index (comfort) for today
    sky_condition_text:          parts[48],                      // string  | Textual sky condition (e.g. “Overcast_and_gloomy/Dry”)
    rain_accum_percent:          parseFloat(parts[49]),          // %      | Current % of daily rain‐gauge capacity
    wind_speed_percent:          parseInt(parts[50], 10),        // %      | Wind speed % of anemometer full scale
    wind_gust_percent:           parseInt(parts[51], 10),        // %      | Wind gust % of anemometer full scale
    battery_flag:                parseInt(parts[52], 10),        // int    | Battery diagnostic flag (0=OK,1=Low,2=Critical)
    sensor_flag_1:               parseInt(parts[53], 10),        // int    | Sensor group 1 status (0=OK,1=fault)
    sensor_flag_2:               parseInt(parts[54], 10),        // int    | Sensor group 2 status
    sensor_flag_3:               parseInt(parts[55], 10),        // int    | Sensor group 3 status
    sensor_flag_4:               parseInt(parts[56], 10),        // int    | Sensor group 4 status
    maintenance_required:        parseInt(parts[57], 10),        // 0/1    | Service required flag (1 = yes)
    diagnostic_code:             parseInt(parts[58], 10),        // 0–3    | Internal self‐test code
    last_service_interval:       parseInt(parts[59], 10),        // days   | Days since last service (or code if overdue)
    avg_temp_24h:                parseFloat(parts[60]),          // °C     | 24 h rolling average temperature
    avg_hum_24h:                 parseFloat(parts[61]),          // %      | 24 h rolling average humidity
    baro_rise_3h:                parseFloat(parts[62]),          // hPa    | Barometric change over last 3 h (scaled)
    current_date:                parts[63],                      // string | “DD/M/YYYY” local date of this measurement
    last_hour_max_temp:          parseFloat(parts[64]),          // °C     | Max temp in last hour (duplicate of field 65)
    last_hour_min_temp:          parseFloat(parts[65]),          // °C     | Min temp in last hour (duplicate of field 66)
    last_hour_avg_hum:           parseFloat(parts[66]),          // %      | Avg RH in last hour
    last_hour_max_solar:         parseFloat(parts[67]),          // W/m²   | Max solar radiation in last hour
    last_hour_min_solar:         parseFloat(parts[68]),          // W/m²   | Min solar radiation in last hour
    last_hour_max_uv:            parseFloat(parts[69]),          // (×10)  | Max UV (×10) in last hour
    forecast_max_temp_day1:      parseFloat(parts[70]),          // °C     | Forecasted max temp next 24 h (Day 1)
    forecast_min_temp_day1:      parseFloat(parts[71]),          // °C     | Forecasted min temp next 24 h (Day 1)
    forecast_precip_day1:        parseFloat(parts[72]),          // mm     | Forecasted precip next 24 h (Day 1)
    forecast_wind_speed_day1:    parseFloat(parts[73]),          // m/s    | Forecasted avg wind next 24 h (Day 1)
    forecast_wind_gust_day1:     parseFloat(parts[74]),          // m/s    | Forecasted max gust next 24 h (Day 1)
    max_temp_7d:                 parseFloat(parts[75]),          // °C     | Max outdoor temp over past 7 days
    min_temp_7d:                 parseFloat(parts[76]),          // °C     | Min outdoor temp over past 7 days
    avg_temp_7d:                 parseFloat(parts[77]),          // °C     | 7‐day rolling average temperature
    max_hum_7d:                  parseFloat(parts[78]),          // %      | Max humidity over past 7 days
    min_hum_7d:                  parseFloat(parts[79]),          // %      | Min humidity over past 7 days
    avg_hum_7d:                  parseFloat(parts[80]),          // %      | 7‐day rolling average humidity
    battery_voltage_mv:          parseFloat(parts[81]),          // mV     | Battery voltage (millivolts)
    battery_voltage_v:           parseFloat(parts[82]),          // V      | Battery voltage (volts)
    forecast_max_temp_day2:      parseFloat(parts[83]),          // °C     | Forecasted max temp Day 2
    forecast_min_temp_day2:      parseFloat(parts[84]),          // °C     | Forecasted min temp Day 2
    forecast_precip_day2:        parseFloat(parts[85]),          // mm     | Forecasted precip Day 2
    forecast_wind_speed_day2:    parseFloat(parts[86]),          // m/s    | Forecasted avg wind Day 2
    forecast_wind_gust_day2:     parseFloat(parts[87]),          // m/s    | Forecasted max gust Day 2
    forecast_max_temp_day3:      parseFloat(parts[88]),          // °C     | Forecasted max temp Day 3
    forecast_min_temp_day3:      parseFloat(parts[89]),          // °C     | Forecasted min temp Day 3
    forecast_precip_day3:        parseFloat(parts[90]),          // mm     | Forecasted precip Day 3
    forecast_wind_speed_day3:    parseFloat(parts[91]),          // m/s    | Forecasted avg wind Day 3
    forecast_max_temp_day4:      parseFloat(parts[92]),          // °C     | Forecasted max temp Day 4
    forecast_min_temp_day4:      parseFloat(parts[93]),          // °C     | Forecasted min temp Day 4
    forecast_precip_day4:        parseFloat(parts[94]),          // mm     | Forecasted precip Day 4
    forecast_wind_speed_day4:    parseFloat(parts[95]),          // m/s    | Forecasted avg wind Day 4
    forecast_wind_gust_day4:     parseFloat(parts[96]),          // m/s    | Forecasted max gust Day 4
    forecast_max_temp_day5:      parseFloat(parts[97]),          // °C     | Forecasted max temp Day 5
    forecast_min_temp_day5:      parseFloat(parts[98]),          // °C     | Forecasted min temp Day 5
    forecast_precip_day5:        parseFloat(parts[99]),          // mm     | Forecasted precip Day 5
    today_max_temp:              parseFloat(parts[100]),         // °C     | Today’s high (duplicate of field 44)
    today_min_temp:              parseFloat(parts[101]),         // °C     | Today’s low (duplicate of field 45)
    today_avg_temp:              parseFloat(parts[102]),         // °C     | Today’s rolling average temperature
    today_avg_hum:               parseFloat(parts[103]),         // %      | Today’s rolling average humidity
    today_peak_wind_speed:       parseFloat(parts[104]),         // m/s    | Today’s highest wind speed
    today_peak_wind_gust:        parseFloat(parts[105]),         // m/s    | Today’s highest wind gust
    seasonal_max_temp:           parseFloat(parts[106]),         // °C     | Max outdoor temp this season
    seasonal_min_temp:           parseFloat(parts[107]),         // °C     | Min outdoor temp this season
    latitude:                    parseFloat(parts[108]),         // °      | Station latitude (decimal degrees)
    longitude:                   parseFloat(parts[109]),         // °      | Station longitude (decimal degrees)
    soil_moisture_1:             parseFloat(parts[110]),         // %      | Soil moisture probe 1 (% saturation)
    soil_temp_1:                 parseFloat(parts[111]),         // °C     | Soil temperature probe 1
    soil_moisture_2:             parseFloat(parts[112]),         // %      | Soil moisture probe 2
    soil_temp_2:                 parseFloat(parts[113]),         // °C     | Soil temperature probe 2
    leaf_wetness:                parts[114],                     // string | Leaf‐wetness sensor reading or “HH:MM” if none
    lighting_detection_time:     parts[115],                     // string | Time of last sunrise/sunset update (“HH:MM”)
    last_light_sensor_update:    parts[116],                     // string | Redundant: last light update time (“HH:MM”)
    last_soil_sensor_update:     parts[117],                     // string | Time of last soil sensor update (“HH:MM”)
    leaf_wetness_raw:            parseFloat(parts[118]),         // unitless | Raw leaf‐wetness output (0–255)
    appliance_power_status:      parseInt(parts[119], 10),       // int     | Aux power or solar panel status (0=OK,1=Low)
    debug_counter:               parseInt(parts[120], 10),       // int     | Internal debug loop counter
    serial_crc:                  parseInt(parts[121], 10),       // int     | CRC code for the ASCII packet
    firmware_version:            parts[122],                     // string  | Firmware version marker (“!!C10.37S151!!”)
    end_of_packet_marker:        parts[123],                     // string  | End‐of‐packet marker (often same as firmware_version)

    /* Fields 125–178 are reserved for future expansion—map individually as “reserved1” through “reserved54”. */
    // reserved1:                   parts[124]  !== undefined ? parseFloat(parts[124]) : undefined,
    // reserved2:                   parts[125]  !== undefined ? parseFloat(parts[125]) : undefined,
    // ... and so on through reserved54 if needed ...
  };
}

export function useWeatherData() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetchAndAppend() {
      try {
        const res = await fetch('/clientraw.txt');
        const text = await res.text();
        const entry = parseRaw(text);
        if (!mounted) return;
        setHistory(prev => {
          const cutoff = Date.now() - 24 * 60 * 60 * 1000;
          const recent = prev.filter(e => e.timestamp >= cutoff);
          return [...recent, entry];
        });
      } catch (err) {
        console.error('weather fetch error', err);
      }
    }

    fetchAndAppend();
    const iv = setInterval(fetchAndAppend, 20_000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  return history;
}
