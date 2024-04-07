##################################################################
#
# CTA-Ridership-Map
#
# System: MacOS using VS Code
# Author: Kaito Sekiya
# 
# File: process_data.py
#
# TODO
#                                                                   
##################################################################


####################### Built-in libraries #######################
import json


######################## Other libraries #########################
import numpy as np
import pandas as pd
import geopandas as gpd


#
# Load and process CTA L's stations geojson data
#
stations_gdf = gpd.read_file(
    "src/CTA_L_Stations.geojson"
).drop(
    columns=["Field_1", "POINT_X", "POINT_Y", "Station Name"]
).rename(
    columns={
        "Park and Ride": "P&D",
        "Rail Line": "Lines",
        "Station ID": "ID"
    }
).sort_values(by="ID")

stations_gdf["Lines"] = stations_gdf["Lines"].str.replace(pat="\(.*?\)", repl="", regex=True)
stations_gdf["Lines"] = stations_gdf["Lines"].str.replace(pat="&amp;", repl=",", regex=True)

for pat in [", Evanston Express", "Lines", "Line", " "]:
    stations_gdf["Lines"] = stations_gdf["Lines"].str.replace(pat, "")

stations_gdf["Lines"] = stations_gdf["Lines"].apply(
    lambda lines: ",".join(sorted(lines.split(",")))
)

stations_gdf["ADA"] = stations_gdf["ADA"].map(lambda ada: ada == "ADA Accessible")

stations_gdf = stations_gdf[["ID", "ADA", "Address", "P&D", "Lines", "Name", "geometry"]]
stations_gdf = stations_gdf.rename(columns={"Name": "Station"}) # idk why but renaming name at beginning doesn't work


#
# Load and process CTA L's lines geojson data
#
lines_gdf = gpd.read_file(
    "src/CTA_L_Lines.geojson"
).filter(
    items=["Name", "geometry"]
).rename(
    columns={"Name": "Lines"}
)

lines_gdf["Lines"] = lines_gdf["Lines"].str.replace(pat="\(.*?\)", repl="", regex=True)

for pat in ["Line", " "]:
    lines_gdf["Lines"] = lines_gdf["Lines"].str.replace(pat, "")

lines_gdf["Lines"] = lines_gdf["Lines"].apply(
    lambda lines: ",".join(sorted(lines.split(",")))
)


#
# Combine the two geo dataframes
#
stations_features = json.loads(stations_gdf.to_json())["features"]
lines_features = json.loads(lines_gdf.to_json())["features"]

cta_gdf = gpd.GeoDataFrame.from_features([
    *json.loads(stations_gdf.to_json())["features"],
    *json.loads(lines_gdf.to_json())["features"]
])
cta_gdf.crs = "urn:ogc:def:crs:OGC:1.3:CRS84"

cta_gdf.to_file("../client/src/assets/CTA_L.geojson", driver="GeoJSON")


# Read json as a string and remove unnecessary properties to speed up the app
with open("../client/src/assets/CTA_L.geojson", "r") as geojson_f:
    geojson = geojson_f.read().replace(
        '"ID": null, "ADA": null, "Address": null, "P&D": null,', ""
    ).replace(
        ', "Station": null', ""
    )

# Write cleaned string back
with open("out/CTA_L.geojson", "w") as geojson_f:
    geojson_f.write(geojson)


#
# Load and process CTA L's stations daily ridership data
#
ridership_df = pd.read_csv(
    "src/CTA_L_Daily_Ridership.csv",
    usecols=[0, 2, 4]
).rename(
    columns={
        "station_id": "ID",
        "date": "Date",
        "rides": "Rides"
    }
).sort_values(
    by=["Date", "ID"]
)

# Subtract 40000 from each ID
ridership_df["ID"] -= 40000
ridership_df["Date"] = ridership_df["Date"].str.replace("/", "-")


# Save JSON string to a file
with open("out/ridership.json", 'w') as f:
    f.write(ridership_df.to_json(orient="records", indent=4))

gdf = gpd.read_file(
    "../client/src/assets/points_full_100.geojson"
)
gdf.to_file("../client/src/assets/points_full_100.geojson", driver="GeoJSON")

exit()

with open("out/ridership.json", "w") as f_json:
    f_json.write(
        json.dumps(
            ridership_df.head(n=100).to_dict(orient="index"), 
            indent=4
        )
    )
exit()

with open("out/ridership.json", "w") as f_json:
    f_json.write(
        json.dumps(
            ridership_df.groupby("ID").apply(
                lambda x: x.set_index("Date")["Rides"].to_dict()
            ).to_dict(), 
            indent=4
        )
    )




# with open("out/ridership.json", "r") as json_f:
#     data = json.load(json_f)

#     with open("dump.txt", "w") as f:
#         for id in data:
#             if id == "900":
#                 exit()
#             f.write(json.dumps(f"{id}: {data[id]}", indent=4) + ",\n")