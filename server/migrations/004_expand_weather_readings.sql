DROP TABLE IF EXISTS weather_readings;

CREATE TABLE weather_readings (
  `id`                            BIGINT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `ts`                            BIGINT      NOT NULL,
  `station_id`                    FLOAT,
  `average_windspeed`             FLOAT,
  `current_windspeed`             FLOAT,
  `wind_dir`                      FLOAT,
  `out_temp`                      FLOAT,
  `out_hum`                       FLOAT,
  `barometer`                     FLOAT,
  `day_rain`                      FLOAT,
  `month_rain`                    FLOAT,
  `year_rain`                     FLOAT,
  `rain_rate_mm_min`              FLOAT,
  `rain_rate_max_mm_min`          FLOAT,
  `in_temp`                       FLOAT,
  `in_hum`                        FLOAT,
  `soil_temp`                     FLOAT,
  `forecast_icon_code`            INT,
  `wmr968_extra_temp`             FLOAT,
  `wmr968_extra_hum`              FLOAT,
  `wmr968_extra_sensor`           INT,
  `yesterday_rain`                FLOAT,
  `extra_temp_sensor_1`           FLOAT,
  `extra_temp_sensor_2`           FLOAT,
  `extra_temp_sensor_3`           FLOAT,
  `extra_temp_sensor_4`           FLOAT,
  `extra_temp_sensor_5`           FLOAT,
  `extra_temp_sensor_6`           FLOAT,
  `extra_hum_sensor_1`            FLOAT,
  `extra_hum_sensor_2`            FLOAT,
  `extra_hum_sensor_3`            FLOAT,
  `measurement_hour`              INT,
  `measurement_minute`            INT,
  `measurement_second`            INT,
  `location_label`                VARCHAR(255),
  `lightning_count_since_noon`    INT,
  `solar_percent_of_max`          INT,
  `measurement_day`               INT,
  `measurement_month`             INT,
  `wmr968_batt1`                  FLOAT,
  `wmr968_batt2`                  FLOAT,
  `wmr968_batt3`                  FLOAT,
  `wmr968_batt4`                  FLOAT,
  `wmr968_batt5`                  FLOAT,
  `wmr968_batt6`                  FLOAT,
  `wmr968_batt7`                  FLOAT,
  `wind_chill`                    FLOAT,
  `humidex`                       FLOAT,
  `max_temp_today`                FLOAT,
  `min_temp_today`                FLOAT,
  `current_condition_icon`        INT,
  `sky_condition_text`            VARCHAR(255),
  `baro_trend_last_hour`          FLOAT,
  `windspeed_hour_01`             FLOAT,
  `windspeed_hour_02`             FLOAT,
  `windspeed_hour_03`             FLOAT,
  `windspeed_hour_04`             FLOAT,
  `windspeed_hour_05`             FLOAT,
  `windspeed_hour_06`             FLOAT,
  `windspeed_hour_07`             FLOAT,
  `windspeed_hour_08`             FLOAT,
  `windspeed_hour_09`             FLOAT,
  `windspeed_hour_10`             FLOAT,
  `windspeed_hour_11`             FLOAT,
  `windspeed_hour_12`             FLOAT,
  `windspeed_hour_13`             FLOAT,
  `windspeed_hour_14`             FLOAT,
  `windspeed_hour_15`             FLOAT,
  `windspeed_hour_16`             FLOAT,
  `windspeed_hour_17`             FLOAT,
  `windspeed_hour_18`             FLOAT,
  `windspeed_hour_19`             FLOAT,
  `windspeed_hour_20`             FLOAT,
  `max_wind_gust`                 FLOAT,
  `dew_point`                     FLOAT,
  `cloud_height`                  FLOAT,
  `current_date`                  VARCHAR(255),
  `max_humidex`                   FLOAT,
  `min_humidex`                   FLOAT,
  `max_windchill`                 FLOAT,
  `min_windchill`                 FLOAT,
  `uv_index`                      FLOAT,
  `hr_windspeed_01`               FLOAT,
  `hr_windspeed_02`               FLOAT,
  `hr_windspeed_03`               FLOAT,
  `hr_windspeed_04`               FLOAT,
  `hr_windspeed_05`               FLOAT,
  `hr_windspeed_06`               FLOAT,
  `hr_windspeed_07`               FLOAT,
  `hr_windspeed_08`               FLOAT,
  `hr_windspeed_09`               FLOAT,
  `hr_windspeed_10`               FLOAT,
  `hr_temp_01`                    FLOAT,
  `hr_temp_02`                    FLOAT,
  `hr_temp_03`                    FLOAT,
  `hr_temp_04`                    FLOAT,
  `hr_temp_05`                    FLOAT,
  `hr_temp_06`                    FLOAT,
  `hr_temp_07`                    FLOAT,
  `hr_temp_08`                    FLOAT,
  `hr_temp_09`                    FLOAT,
  `hr_temp_10`                    FLOAT,
  `hr_rain_01`                    FLOAT,
  `hr_rain_02`                    FLOAT,
  `hr_rain_03`                    FLOAT,
  `hr_rain_04`                    FLOAT,
  `hr_rain_05`                    FLOAT,
  `hr_rain_06`                    FLOAT,
  `hr_rain_07`                    FLOAT,
  `hr_rain_08`                    FLOAT,
  `hr_rain_09`                    FLOAT,
  `hr_rain_10`                    FLOAT,
  `max_heat_index`                FLOAT,
  `min_heat_index`                FLOAT,
  `heat_index`                    FLOAT,
  `max_avg_windspeed_today`       FLOAT,
  `lightning_count_last_minute`   INT,
  `last_lightning_time`           VARCHAR(255),
  `last_lightning_date`           VARCHAR(255),
  `avg_wind_direction`            FLOAT,
  `nexstorm_last_strike_distance` FLOAT,
  `nexstorm_last_strike_bearing`  FLOAT,
  `extra_temp_sensor_7`           FLOAT,
  `extra_temp_sensor_8`           FLOAT,
  `extra_hum_sensor_4`            FLOAT,
  `extra_hum_sensor_5`            FLOAT,
  `extra_hum_sensor_6`            FLOAT,
  `extra_hum_sensor_7`            FLOAT,
  `extra_hum_sensor_8`            FLOAT,
  `vp_solar_wm2`                  FLOAT,
  `max_in_temp`                   FLOAT,
  `min_in_temp`                   FLOAT,
  `apparent_temp`                 FLOAT,
  `max_baro`                      FLOAT,
  `min_baro`                      FLOAT,
  `max_gust_last_hour`            FLOAT,
  `max_gust_last_hour_time`       VARCHAR(255),
  `max_gust_today_time`           VARCHAR(255),
  `max_apparent_temp`             FLOAT,
  `min_apparent_temp`             FLOAT,
  `max_dew_point`                 FLOAT,
  `min_dew_point`                 FLOAT,
  `max_gust_last_minute`          FLOAT,
  `current_year`                  INT,
  `thsw_index`                    FLOAT,
  `temp_trend`                    INT,
  `humidity_trend`                INT,
  `humidex_trend`                 INT,
  `hr_wind_dir_01`                FLOAT,
  `hr_wind_dir_02`                FLOAT,
  `hr_wind_dir_03`                FLOAT,
  `hr_wind_dir_04`                FLOAT,
  `hr_wind_dir_05`                FLOAT,
  `hr_wind_dir_06`                FLOAT,
  `hr_wind_dir_07`                FLOAT,
  `hr_wind_dir_08`                FLOAT,
  `hr_wind_dir_09`                FLOAT,
  `hr_wind_dir_10`                FLOAT,
  `leaf_wetness_vp`               FLOAT,
  `soil_moisture_vp`              FLOAT,
  `avg_wind_10min`                FLOAT,
  `wet_bulb_temp`                 FLOAT,
  `latitude`                      FLOAT,
  `longitude`                     FLOAT,
  `rain_9am_reset`                FLOAT,
  `daily_high_humidity`           FLOAT,
  `daily_low_humidity`            FLOAT,
  `rain_midnight_reset`           FLOAT,
  `daily_low_windchill_time`      VARCHAR(255),
  `cost_channel_1_watts`          FLOAT,
  `cost_channel_2_watts`          FLOAT,
  `cost_channel_3_watts`          FLOAT,
  `cost_channel_4_watts`          FLOAT,
  `cost_channel_5_watts`          FLOAT,
  `cost_channel_6_watts`          FLOAT,
  `daily_wind_run_km`             FLOAT,
  `daily_max_temp_time`           VARCHAR(255),
  `daily_min_temp_time`           VARCHAR(255),
  `avg_wind_dir_10min`            FLOAT,
  `firmware_version`              VARCHAR(255),
  `createdAt`                     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;