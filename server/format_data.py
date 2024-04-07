import csv
import json
import numpy as np
import pandas as pd
import geopandas as gpd


#
#
#
stations_gdf = gpd.read_file(
    "src_data/CTA_L_Stations.geojson"
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

stations_gdf.to_file("../client/src/assets/CTA_L_Stations.geojson", driver="GeoJSON")

lines_gdf = gpd.read_file(
    "src_data/CTA_L_Lines.geojson"
)
# print(json.dumps(list(lines_gdf.columns)))


#
#
#
lines_gdf = gpd.read_file(
    "src_data/CTA_L_Lines.geojson"
).filter(
    items=["geometry"]
)

lines_gdf["color"] = "#FFFFFF"

# .drop(
#     columns=["ALT_LEGEND", "BRANCH","DESCRIPTIO", "Field_1", "LEGEND", "LINES", "OWL", "SHAPE", "SHAPE.LEN", "TYPE"]
# ).rename(
#     columns={
#         "Name": "Lines"
#     }
# )

# lines_gdf["Lines"] = lines_gdf["Lines"].str.replace(pat="\(.*?\)", repl="", regex=True)

# for pat in [", Evanston Express", "Lines", "Line", " "]:
#     lines_gdf["Lines"] = stations_gdf["Lines"].str.replace(pat, "")

#         "Park and Ride": "P&D",
#         "Rail Line": "Lines",
#         "Station ID": "ID"
#     }
# ).sort_values(by="ID")

lines_gdf.to_file("../client/src/assets/CTA_L_Lines.geojson", driver="GeoJSON")

with open("dump.txt", "w") as f:
    f.write(lines_gdf.to_string())
    exit()