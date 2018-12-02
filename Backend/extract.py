import csv
import json
import os
import sys

# set script dir as cwd
os.chdir(sys.path[0])


def csv_to_dict_list(csv_filename):
    with open(csv_filename, 'r') as csv_file:
        reader = csv.DictReader(csv_file)
        dict_list = []
        for line in reader:
            dict_list.append(line)

        return dict_list


if __name__ == '__main__':
    start_year = 2011
    end_year = 2011

    stations = {}

    for year in range(start_year, end_year + 1):
        dataset_name = f'hubway_Trips_{year}'
        print(dataset_name)

        d = csv_to_dict_list(f'{dataset_name}.csv')

        for trip in d:
            start_station = trip['Start station name']

            if not start_station in stations:
                stations[start_station] = {
                    'station': start_station,
                    'outgoing': 1,
                    'incoming': 0
                }

            else:
                stations[start_station]['outgoing'] += 1

            end_station = trip['End station name']
            if not end_station in stations:
                stations[end_station] = {
                    'station': end_station,
                    'outgoing': 1,
                    'incoming': 0
                }

            else:
                stations[end_station]['incoming'] += 1

        station_items = list(stations.values())
        print(station_items)

        with open(f'{dataset_name}.json', 'w') as outfile:
            json.dump(station_items, outfile, indent=2)

        with open(f'station_trips_{year}.csv', 'w', newline='') as f:
            w = csv.DictWriter(f, station_items[0])
            w.writeheader()
            w.writerows(station_items)
            f.close()
