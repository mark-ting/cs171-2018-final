import csv
import mysql.connector
import os
import sys

def is_number(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

if __name__ == '__main__':

    # set script dir as cwd
    os.chdir(sys.path[0])

    station_name_to_id = {}
    stations = station_name_to_id.keys()

    with open(f'Hubway_Stations_as_of_July_2017.csv', 'r') as station_file:
            reader = csv.DictReader(station_file)
            for row in reader:
                station_id = row['Station ID']
                station_name = row['Station']
                station_name_to_id[station_name] = station_id

    with open('hubway_Trips_2015.csv','r') as infile, open("hubway_Trips_2015_v2.csv", "w", newline='') as outfile:
        reader = csv.DictReader(infile)
        writer = csv.writer(outfile)

        omitted = 0

        for row in reader:
            base_start = row['start station name']
            base_end = row['end station name']

            if base_start not in stations:
                # print(f'Missing start: {base_start}')
                omitted += 1
                continue

            if base_end not in stations:
                # print(f'Missing start: {base_end}')
                omitted += 1
                continue

            birth_year = row['birth year']
            if not is_number(birth_year):
                # print(f'Invalid birth date year')
                omitted += 1
                continue

            row['start station name'] = station_name_to_id[base_start]
            row['end station name'] = station_name_to_id[base_end]
            writer.writerow(row.values())