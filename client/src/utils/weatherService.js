// client/src/utils/weatherService.js

import { useState, useEffect } from 'react';

export function parseRaw(raw) {
  const parts = raw.trim().split(/\s+/);
  return {
    timestamp:                   Date.now(),                     // ms | Unix timestamp when this parsing occurs
    station_id:                  parseFloat(parts[0]),           // label | Beginning of file marker or station ID
    average_windspeed:           parseFloat(parts[1]),           // knots | Average windspeed (last 60 secs)
    current_windspeed:           parseFloat(parts[2]),           // knots | Current windspeed
    wind_dir:                    parseFloat(parts[3]),           // degrees | Wind direction (0–360°)
    out_temp:                    parseFloat(parts[4]),           // °C | Outdoor temperature
    out_hum:                     parseFloat(parts[5]),           // % | Outdoor humidity
    barometer:                   parseFloat(parts[6]),           // hPa | Barometric pressure
    day_rain:                    parseFloat(parts[7]),           // mm | Daily rainfall
    month_rain:                  parseFloat(parts[8]),           // mm | Monthly rainfall
    year_rain:                   parseFloat(parts[9]),           // mm | Yearly rainfall
    rain_rate_mm_min:            parseFloat(parts[10]),          // mm/min | Rain rate (current)
    rain_rate_max_mm_min:        parseFloat(parts[11]),          // mm/min | Max rain rate
    in_temp:                     parseFloat(parts[12]),          // °C | Indoor temperature
    in_hum:                      parseFloat(parts[13]),          // % | Indoor humidity
    soil_temp:                   parseFloat(parts[14]),          // °C | Soil temperature (optional)
    forecast_icon_code:          parseInt(parts[15], 10),        // int | Forecast icon code
    wmr968_extra_temp:           parseFloat(parts[16]),          // °C | WMR968 extra temperature
    wmr968_extra_hum:            parseFloat(parts[17]),          // % | WMR968 extra humidity
    wmr968_extra_sensor:         parseInt(parts[18], 10),        // int | WMR968 extra sensor number
    yesterday_rain:              parseFloat(parts[19]),          // mm | Yesterday's rainfall
    extra_temp_sensor_1:         parseFloat(parts[20]),          // °C | Extra temperature sensor 1
    extra_temp_sensor_2:         parseFloat(parts[21]),          // °C | Extra temperature sensor 2
    extra_temp_sensor_3:         parseFloat(parts[22]),          // °C | Extra temperature sensor 3
    extra_temp_sensor_4:         parseFloat(parts[23]),          // °C | Extra temperature sensor 4
    extra_temp_sensor_5:         parseFloat(parts[24]),          // °C | Extra temperature sensor 5
    extra_temp_sensor_6:         parseFloat(parts[25]),          // °C | Extra temperature sensor 6
    extra_hum_sensor_1:          parseFloat(parts[26]),          // % | Extra humidity sensor 1
    extra_hum_sensor_2:          parseFloat(parts[27]),          // % | Extra humidity sensor 2
    extra_hum_sensor_3:          parseFloat(parts[28]),          // % | Extra humidity sensor 3
    measurement_hour:            parseInt(parts[29], 10),        // hour | Measurement time (hour)
    measurement_minute:          parseInt(parts[30], 10),        // minute | Measurement time (minute)
    measurement_second:          parseInt(parts[31], 10),        // second | Measurement time (second)
    location_label:              parts[32],                      // string | Station name and time
    lightning_count_since_noon:  parseInt(parts[33], 10),        // int | Lightning counts since noon
    solar_percent_of_max:        parseInt(parts[34], 10),        // % | Solar percent of max
    measurement_day:             parseInt(parts[35], 10),        // day | Day of measurement
    measurement_month:           parseInt(parts[36], 10),        // month | Month of measurement
    wmr968_batt1:                parseFloat(parts[37]),          // % | WMR968 battery 1
    wmr968_batt2:                parseFloat(parts[38]),          // % | WMR968 battery 2
    wmr968_batt3:                parseFloat(parts[39]),          // % | WMR968 battery 3
    wmr968_batt4:                parseFloat(parts[40]),          // % | WMR968 battery 4
    wmr968_batt5:                parseFloat(parts[41]),          // % | WMR968 battery 5
    wmr968_batt6:                parseFloat(parts[42]),          // % | WMR968 battery 6
    wmr968_batt7:                parseFloat(parts[43]),          // % | WMR968 battery 7
    wind_chill:                  parseFloat(parts[44]),          // °C | Wind chill temperature
    humidex:                     parseFloat(parts[45]),          // °C | Humidex
    max_temp_today:              parseFloat(parts[46]),          // °C | Today's max temperature
    min_temp_today:              parseFloat(parts[47]),          // °C | Today's min temperature
    current_condition_icon:      parseInt(parts[48], 10),        // int | Current condition icon
    sky_condition_text:          parts[49],                      // string | Weather description
    baro_trend_last_hour:        parseFloat(parts[50]),          // hPa | Barometer trend over last hour
    windspeed_hour_01:           parseFloat(parts[51]),          // knots | Windspeed hour 1
    windspeed_hour_02:           parseFloat(parts[52]),          // knots | Windspeed hour 2
    windspeed_hour_03:           parseFloat(parts[53]),          // knots | Windspeed hour 3
    windspeed_hour_04:           parseFloat(parts[54]),          // knots | Windspeed hour 4
    windspeed_hour_05:           parseFloat(parts[55]),          // knots | Windspeed hour 5
    windspeed_hour_06:           parseFloat(parts[56]),          // knots | Windspeed hour 6
    windspeed_hour_07:           parseFloat(parts[57]),          // knots | Windspeed hour 7
    windspeed_hour_08:           parseFloat(parts[58]),          // knots | Windspeed hour 8
    windspeed_hour_09:           parseFloat(parts[59]),          // knots | Windspeed hour 9
    windspeed_hour_10:           parseFloat(parts[60]),          // knots | Windspeed hour 10
    windspeed_hour_11:           parseFloat(parts[61]),          // knots | Windspeed hour 11
    windspeed_hour_12:           parseFloat(parts[62]),          // knots | Windspeed hour 12
    windspeed_hour_13:           parseFloat(parts[63]),          // knots | Windspeed hour 13
    windspeed_hour_14:           parseFloat(parts[64]),          // knots | Windspeed hour 14
    windspeed_hour_15:           parseFloat(parts[65]),          // knots | Windspeed hour 15
    windspeed_hour_16:           parseFloat(parts[66]),          // knots | Windspeed hour 16
    windspeed_hour_17:           parseFloat(parts[67]),          // knots | Windspeed hour 17
    windspeed_hour_18:           parseFloat(parts[68]),          // knots | Windspeed hour 18
    windspeed_hour_19:           parseFloat(parts[69]),          // knots | Windspeed hour 19
    windspeed_hour_20:           parseFloat(parts[70]),          // knots | Windspeed hour 20
    max_wind_gust:               parseFloat(parts[71]),          // knots | Max wind gust
    dew_point:                   parseFloat(parts[72]),          // °C | Dew point
    cloud_height:                parseFloat(parts[73]),          // feet | Cloud height
    current_date:                parts[74],                      // string | Date in station-defined format
    max_humidex:                 parseFloat(parts[75]),          // °C | Max humidex
    min_humidex:                 parseFloat(parts[76]),          // °C | Min humidex
    max_windchill:               parseFloat(parts[77]),          // °C | Max wind chill
    min_windchill:               parseFloat(parts[78]),          // °C | Min wind chill
    uv_index:                    parseFloat(parts[79]),          // number | UV Index (Davis VP)
    hr_windspeed_01:             parseFloat(parts[80]),          // knots | Hr Windspeed 01
    hr_windspeed_02:             parseFloat(parts[81]),          // knots | Hr Windspeed 02
    hr_windspeed_03:             parseFloat(parts[82]),          // knots | Hr Windspeed 03
    hr_windspeed_04:             parseFloat(parts[83]),          // knots | Hr Windspeed 04
    hr_windspeed_05:             parseFloat(parts[84]),          // knots | Hr Windspeed 05
    hr_windspeed_06:             parseFloat(parts[85]),          // knots | Hr Windspeed 06
    hr_windspeed_07:             parseFloat(parts[86]),          // knots | Hr Windspeed 07
    hr_windspeed_08:             parseFloat(parts[87]),          // knots | Hr Windspeed 08
    hr_windspeed_09:             parseFloat(parts[88]),          // knots | Hr Windspeed 09
    hr_windspeed_10:             parseFloat(parts[89]),          // knots | Hr Windspeed 10
    hr_temp_01:                  parseFloat(parts[90]),          // °C | Hourly Temperature 01
    hr_temp_02:                  parseFloat(parts[91]),          // °C | Hourly Temperature 02
    hr_temp_03:                  parseFloat(parts[92]),          // °C | Hourly Temperature 03
    hr_temp_04:                  parseFloat(parts[93]),          // °C | Hourly Temperature 04
    hr_temp_05:                  parseFloat(parts[94]),          // °C | Hourly Temperature 05
    hr_temp_06:                  parseFloat(parts[95]),          // °C | Hourly Temperature 06
    hr_temp_07:                  parseFloat(parts[96]),          // °C | Hourly Temperature 07
    hr_temp_08:                  parseFloat(parts[97]),          // °C | Hourly Temperature 08
    hr_temp_09:                  parseFloat(parts[98]),          // °C | Hourly Temperature 09
    hr_temp_10:                  parseFloat(parts[99]),          // °C | Hourly Temperature 10
    hr_rain_01:                  parseFloat(parts[100]),         // mm | Hourly Rainfall 01
    hr_rain_02:                  parseFloat(parts[101]),         // mm | Hourly Rainfall 02
    hr_rain_03:                  parseFloat(parts[102]),         // mm | Hourly Rainfall 03
    hr_rain_04:                  parseFloat(parts[103]),         // mm | Hourly Rainfall 04
    hr_rain_05:                  parseFloat(parts[104]),         // mm | Hourly Rainfall 05
    hr_rain_06:                  parseFloat(parts[105]),         // mm | Hourly Rainfall 06
    hr_rain_07:                  parseFloat(parts[106]),         // mm | Hourly Rainfall 07
    hr_rain_08:                  parseFloat(parts[107]),         // mm | Hourly Rainfall 08
    hr_rain_09:                  parseFloat(parts[108]),         // mm | Hourly Rainfall 09
    hr_rain_10:                  parseFloat(parts[109]),         // mm | Hourly Rainfall 10
    max_heat_index:              parseFloat(parts[110]),         // °C | Max heat index
    min_heat_index:              parseFloat(parts[111]),         // °C | Min heat index
    heat_index:                  parseFloat(parts[112]),         // °C | Current heat index
    max_avg_windspeed_today:     parseFloat(parts[113]),         // knots | Max avg windspeed today
    lightning_count_last_minute: parseInt(parts[114], 10),       // number | Lightning count last minute
    last_lightning_time:         parts[115],                     // string | Time of last lightning count (HH:MM or "---")
    last_lightning_date:         parts[116],                     // string | Date of last lightning count (DD/MM/YYYY or "---")
    avg_wind_direction:          parseFloat(parts[117]),         // degrees | Average wind direction
    nexstorm_last_strike_distance: parseFloat(parts[118]),       // number | NexStorm distance last strike
    nexstorm_last_strike_bearing: parseFloat(parts[119]),        // degrees | NexStorm bearing last strike
    extra_temp_sensor_7:         parseFloat(parts[120]),         // °C | Extra temperature sensor 7
    extra_temp_sensor_8:         parseFloat(parts[121]),         // °C | Extra temperature sensor 8
    extra_hum_sensor_4:          parseFloat(parts[122]),         // % | Extra humidity sensor 4
    extra_hum_sensor_5:          parseFloat(parts[123]),         // % | Extra humidity sensor 5
    extra_hum_sensor_6:          parseFloat(parts[124]),         // % | Extra humidity sensor 6
    extra_hum_sensor_7:          parseFloat(parts[125]),         // % | Extra humidity sensor 7
    extra_hum_sensor_8:          parseFloat(parts[126]),         // % | Extra humidity sensor 8
    vp_solar_wm2:                parseFloat(parts[127]),         // W/m² | VP Solar radiation
    max_in_temp:                 parseFloat(parts[128]),         // °C | Max indoor temperature
    min_in_temp:                 parseFloat(parts[129]),         // °C | Min indoor temperature
    apparent_temp:               parseFloat(parts[130]),         // °C | Apparent temperature
    max_baro:                    parseFloat(parts[131]),         // hPa | Max barometric pressure
    min_baro:                    parseFloat(parts[132]),         // hPa | Min barometric pressure
    max_gust_last_hour:          parseFloat(parts[133]),         // knots | Max gust in last hour
    max_gust_last_hour_time:     parts[134],                     // string | Time of max gust last hour
    max_gust_today_time:         parts[135],                     // string | Time of today's max gust
    max_apparent_temp:           parseFloat(parts[136]),         // °C | Max apparent temperature
    min_apparent_temp:           parseFloat(parts[137]),         // °C | Min apparent temperature
    max_dew_point:               parseFloat(parts[138]),         // °C | Max dew point
    min_dew_point:               parseFloat(parts[139]),         // °C | Min dew point
    max_gust_last_minute:        parseFloat(parts[140]),         // knots | Max gust in last minute
    current_year:                parseInt(parts[141], 10),       // int | Current year
    thsw_index:                  parseFloat(parts[142]),         // °C | THSW index
    temp_trend:                  parseInt(parts[143], 10),       // -1/0/1 | Temperature trend
    humidity_trend:              parseInt(parts[144], 10),       // -1/0/1 | Humidity trend
    humidex_trend:               parseInt(parts[145], 10),       // -1/0/1 | Humidex trend
    hr_wind_dir_01:              parseFloat(parts[146]),         // degrees | Hourly wind direction 01
    hr_wind_dir_02:              parseFloat(parts[147]),         // degrees | Hourly wind direction 02
    hr_wind_dir_03:              parseFloat(parts[148]),         // degrees | Hourly wind direction 03
    hr_wind_dir_04:              parseFloat(parts[149]),         // degrees | Hourly wind direction 04
    hr_wind_dir_05:              parseFloat(parts[150]),         // degrees | Hourly wind direction 05
    hr_wind_dir_06:              parseFloat(parts[151]),         // degrees | Hourly wind direction 06
    hr_wind_dir_07:              parseFloat(parts[152]),         // degrees | Hourly wind direction 07
    hr_wind_dir_08:              parseFloat(parts[153]),         // degrees | Hourly wind direction 08
    hr_wind_dir_09:              parseFloat(parts[154]),         // degrees | Hourly wind direction 09
    hr_wind_dir_10:              parseFloat(parts[155]),         // degrees | Hourly wind direction 10
    leaf_wetness_vp:             parseFloat(parts[156]),         // 0–15 | VP Leaf wetness
    soil_moisture_vp:            parseFloat(parts[157]),         // centibars | VP Soil moisture
    avg_wind_10min:              parseFloat(parts[158]),         // knots | 10-minute average wind speed
    wet_bulb_temp:               parseFloat(parts[159]),         // °C | Wet bulb temperature
    latitude:                    parseFloat(parts[160]),         // degrees | Latitude (negative for south)
    longitude:                   parseFloat(parts[161]),         // degrees | Longitude (negative for east)
    rain_9am_reset:              parseFloat(parts[162]),         // mm | Rain total reset at 9am
    daily_high_humidity:         parseFloat(parts[163]),         // % | Daily high humidity
    daily_low_humidity:          parseFloat(parts[164]),         // % | Daily low humidity
    rain_midnight_reset:         parseFloat(parts[165]),         // mm | Rain total reset at midnight
    daily_low_windchill_time:    parts[166],                     // string | Time of daily low wind chill
    cost_channel_1_watts:        parseFloat(parts[167]),         // watts | Current cost channel 1
    cost_channel_2_watts:        parseFloat(parts[168]),         // watts | Current cost channel 2
    cost_channel_3_watts:        parseFloat(parts[169]),         // watts | Current cost channel 3
    cost_channel_4_watts:        parseFloat(parts[170]),         // watts | Current cost channel 4
    cost_channel_5_watts:        parseFloat(parts[171]),         // watts | Current cost channel 5
    cost_channel_6_watts:        parseFloat(parts[172]),         // watts | Current cost channel 6
    daily_wind_run_km:           parseFloat(parts[173]),         // km | Daily wind run
    daily_max_temp_time:         parts[174],                     // string | Time of daily max temperature
    daily_min_temp_time:         parts[175],                     // string | Time of daily min temperature
    avg_wind_dir_10min:          parseFloat(parts[176]),         // degrees | 10-minute average wind direction
    firmware_version:            parts[177],                     // string | End of file / firmware version
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
    const iv = setInterval(fetchAndAppend, 2_000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  return history;
}
