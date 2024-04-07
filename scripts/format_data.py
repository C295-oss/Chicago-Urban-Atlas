import csv
import json
import numpy as np
import pandas as pd
import geopandas as gpd


#
#
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

stations_features = json.loads(stations_gdf.to_json())["features"]
# stations_gdf.to_file("../client/src/assets/CTA_L_Stations.geojson", driver="GeoJSON")


#
#
#
lines_gdf = gpd.read_file(
    "src/CTA_L_Lines.geojson"
).filter(
    items=["geometry"]
)

lines_gdf["color"] = "#FFFFFF"

lines_features = json.loads(lines_gdf.to_json())["features"]



#
#
#
cta_gdf = gpd.GeoDataFrame.from_features(stations_features + lines_features)
cta_gdf.crs = "urn:ogc:def:crs:OGC:1.3:CRS84"

cta_gdf.to_file("../client/src/assets/CTA_L.geojson", driver="GeoJSON")


with open("../client/src/assets/CTA_L.geojson", "r") as geojson_f:
    geojson = geojson_f.read().replace(
        '"properties": { "ID": null, "ADA": null, "Address": null, "P&D": null, "Lines": null, "Station": null, "color": "#FFFFFF" }, ', ""
    )

with open("../client/src/assets/CTA_L.geojson", "w") as geojson_f:
    geojson_f.write(geojson)