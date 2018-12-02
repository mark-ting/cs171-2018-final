import csv
import mysql.connector
import os

def upload_stations(conn):
    print('Uploading station data up to 2017}')
    with open(f'Hubway_Stations_as_of_July_2017.csv', 'r') as station_file:
        reader = csv.reader(station_file)
        header = next(reader)

        field_names = [
            'id',
            'name',
            'latitude',
            'longitude',
            'municipality',
            'docks'
        ]

        fields = ','.join(field_names)
        values = ','.join([r'%s'] * len(field_names))
        query = f'INSERT INTO stations ({fields}) values ({values})'
        cursor = conn.cursor()

        for row in reader:
            cursor.execute(query, row)
        conn.commit()


def upload_ride_data(year):
    print(f'Uploading ride data for {year}')
    dataset_name = f'hubway_Trips_{year}'

    with open(f'hubway_Trips_2015_v2.csv', 'r') as ride_file:
    # with open(f'{dataset_name}.csv', 'r') as ride_file:
        reader = csv.reader(ride_file)
        header = next(reader)

        field_names = [
            'duration',
            'start_time',
            'end_time',
            'start_station',
            'end_station',
            'bike_id',
            'user_type',
            'birth_year',
            'gender'
        ]

        fields = ','.join(field_names)
        values = ','.join([r'%s'] * len(field_names))
        query = f'INSERT INTO rides ({fields}) values ({values})'
        cursor = conn.cursor()

        for row in reader:
            # process rows
            for loc in [11, 10, 8, 7, 6, 4, 0]:
                del row[loc]

            cursor.execute(query, row)
        conn.commit()


if __name__ == '__main__':
    conn = mysql.connector.connect(user='bluebike', password='bluebike',
                                  host='vps77598.vps.ovh.ca',
                                  database='bluebike')

    print('Connection opened.')

    start_year = 2015
    end_year = 2015

    # upload_stations(conn)

    for year in range(start_year, end_year + 1):
        upload_ride_data(year)

    conn.close()
    print('Connection closed.')