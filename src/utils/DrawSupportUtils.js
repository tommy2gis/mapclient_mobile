/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:31:41 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:31:41 
 */


/**
 * Utils used in DrawSupport for leaflet
*/

/**
 * Transforms a leaflet bounds object into an array.
 * @prop {object} the bounds
 * @return the array [minx, miny, maxx, maxy]
*/
const boundsToOLExtent = (bounds) => {
    return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
};

/**
 * @return a feature extracted from leaflet layer used in queryform
*/
const fromLeafletFeatureToQueryform = (layer) => {
    let geoJesonFt = layer.toGeoJSON();
    let bounds = layer.getBounds();
    let extent = boundsToOLExtent(bounds);
    let center = bounds.getCenter();
    let radius = layer.getRadius ? layer.getRadius() : 0;
    let coordinates = geoJesonFt.features[0].geometry.coordinates;
    let projection = "EPSG:4326";
    let type = geoJesonFt.features[0].geometry.type;

    // Geometry respect query form panel needs
    return {
        type,
        extent,
        center,
        coordinates,
        radius,
        projection
    };
};

module.exports = {
    boundsToOLExtent,
    fromLeafletFeatureToQueryform
};
