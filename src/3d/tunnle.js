import simplelinearalgebra from "./simplelinearalgebra";
import simplestl from "./simplestl";
var tunnlejs = (function() {
    var createTunnleBySurface = function(config) {
        //Outer and inner wall of the tunnle

        var surfaceWallFunction = function(
            surface,
            radius,
            height,
            horizontalSteps
        ) {
            return function(i, h) {
                var x =
                    surface[h] *
                    radius *
                    Math.sin(((2 * Math.PI) / (horizontalSteps - 1)) * i);
                var y = (height * h) / surface.length;
                var z =
                    surface[h] *
                    radius *
                    Math.cos(((2 * Math.PI) / (horizontalSteps - 1)) * i);
                return { x, y, z };
            };
        };

        var outer = createWallByFunction(
            [
                {
                    top: config.outerSurface.length - 1,
                    left: 0,
                    bottom: 0,
                    right: config.resolution - 1
                }
            ],
            surfaceWallFunction(
                config.outerSurface,
                config.radius,
                config.height,
                config.resolution
            ),
            config.resolution,
            config.outerSurface.length,
            -1
        );
        var inner = createWallByFunction(
            [
                {
                    top: config.outerSurface.length - 1,
                    left: 0,
                    bottom: 0,
                    right: config.resolution - 1
                }
            ],
            surfaceWallFunction(
                config.innerSurface,
                config.radius * (1 - config.thickness),
                config.height,
                config.resolution
            ),
            config.resolution,
            config.innerSurface.length,
            1
        );
        return createTunnle(outer, inner);
    };

    var createMeshPart = function(
        holes,
        outerWallFunction,
        innerWallFunction,
        horizontalResolution,
        verticalResolution
    ) {
        //Outer and inner wall of the tunnle
        var outerHoles = JSON.parse(JSON.stringify(holes));
        var innerHoles = JSON.parse(JSON.stringify(holes));
        var outer = createWallByFunction(
            outerHoles,
            outerWallFunction,
            horizontalResolution,
            verticalResolution,
            -1
        );
        var inner = createWallByFunction(
            innerHoles,
            innerWallFunction,
            horizontalResolution,
            verticalResolution,
            1
        );
        //Top and bottom closure (Will be extended in a future release)
        var closure = createClosures(outer.closureSets, inner.closureSets);

        //Concat the triangles of the tunnle
        var obj = simplelinearalgebra.createObject(
            outer.triangles.concat(inner.triangles).concat(closure)
        );

        return obj;
    };

    var createMesh = function(arrayOfMeshParts) {
        var obj = arrayOfMeshParts[0];
        for (var i = 1; i < arrayOfMeshParts.length; i++) {
            obj.arrayOfTriangles = obj.arrayOfTriangles.concat(
                arrayOfMeshParts[i].arrayOfTriangles
            );
        }

        return simplestl.getFullTextSTL(obj);
    };

    var createClosures = function(outerClosures, innerClosures) {
        var triangles = [];
        for (var c = 0; c < outerClosures.length; c++) {
            var outerVertices = outerClosures[c];
            var innerVertices = innerClosures[c];
            for (var i = 0; i < outerVertices.length; i++) {
                //Bottom closure
                var v1 = outerVertices[i];
                var v2 = outerVertices[(i + 1) % outerVertices.length];
                var v3 = innerVertices[i];
                var v4 = innerVertices[(i + 1) % innerVertices.length];
                try {
                    triangles.push(
                        simplelinearalgebra.createTriangle(v1, v2, v4)
                    );
                    triangles.push(
                        simplelinearalgebra.createTriangle(v3, v1, v4)
                    );
                } catch (e) {
                    var hhh = 1000;
                }
            }
        }

        return triangles;
    };
    //hole: {top:0,left:0,bottom:resolutionVertical-1,right:resolutionHorizontal-1}
    var createWallByFunction = function(
        holes,
        wallFunction,
        resolutionHorizontal,
        resolutionVertical,
        direction
    ) {
        var triangles = [];
        var closureVertices = [];

        var closure = { left: [], right: [], top: [], bottom: [] };

        for (var h = 0; h < resolutionVertical; h++) {
            for (var i = 0; i < resolutionHorizontal; i++) {
                var vertices = [];
                for (var p = 0; p < 2; p++) {
                    for (var q = 0; q < 2; q++) {
                        var groundVector = wallFunction(i + p, h + q);
                        vertices.push(
                            simplelinearalgebra.createVertex(
                                groundVector.x,
                                groundVector.y,
                                groundVector.z
                            )
                        );
                    }
                }

                fillHoles(holes, i, h, vertices);

                if (!isInHole(holes, i, h)) {
                    if (direction < 0) {
                        triangles.push(
                            simplelinearalgebra.createTriangle(
                                vertices[0],
                                vertices[1],
                                vertices[2]
                            )
                        );
                        triangles.push(
                            simplelinearalgebra.createTriangle(
                                vertices[1],
                                vertices[3],
                                vertices[2]
                            )
                        );
                    } else {
                        triangles.push(
                            simplelinearalgebra.createTriangle(
                                vertices[0],
                                vertices[2],
                                vertices[1]
                            )
                        );
                        triangles.push(
                            simplelinearalgebra.createTriangle(
                                vertices[1],
                                vertices[2],
                                vertices[3]
                            )
                        );
                    }
                }
            }
        }

        return { triangles, closureSets: createClosureSets(holes) };
    };

    var isInHole = function(holes, x, y) {
        for (var i = 1; i < holes.length; i++) {
            var hole = holes[i];
            if (
                x >= hole.left &&
                x <= hole.right &&
                y >= hole.bottom &&
                y <= hole.top
            ) {
                return true;
            }
        }
        return false;
    };

    var fillHoles = function(holes, x, y, vertices) {
        for (var i = 0; i < holes.length; i++) {
            if (!holes[i].leftVertices) holes[i].leftVertices = [];
            if (!holes[i].rightVertices) holes[i].rightVertices = [];
            if (!holes[i].topVertices) holes[i].topVertices = [];
            if (!holes[i].bottomVertices) holes[i].bottomVertices = [];

            if (i == 0) {
                if (
                    x >= holes[i].left &&
                    x <= holes[i].right &&
                    y >= holes[i].bottom &&
                    y <= holes[i].top
                ) {
                    if (x == holes[i].left)
                        holes[i].leftVertices.unshift(vertices[0]);
                    if (y == holes[i].bottom)
                        holes[i].bottomVertices.push(vertices[2]);
                    if (x == holes[i].right)
                        holes[i].rightVertices.push(vertices[3]);
                    if (y == holes[i].top)
                        holes[i].topVertices.unshift(vertices[1]);
                }
            } else {
                if (
                    x >= holes[i].left &&
                    x <= holes[i].right &&
                    y >= holes[i].bottom &&
                    y <= holes[i].top
                ) {
                    if (x == holes[i].left)
                        holes[i].leftVertices.push(vertices[1]);
                    if (y == holes[i].bottom)
                        holes[i].bottomVertices.unshift(vertices[0]);
                    if (x == holes[i].right)
                        holes[i].rightVertices.unshift(vertices[2]);
                    if (y == holes[i].top)
                        holes[i].topVertices.push(vertices[3]);
                }
            }
        }
    };

    var createClosureSets = function(holes) {
        var closureSets = [];
        for (var i = 0; i < holes.length; i++) {
            if (i == 0)
                closureSets.push(
                    holes[i].bottomVertices
                        .concat(holes[i].rightVertices)
                        .concat(holes[i].topVertices)
                        .concat(holes[i].leftVertices)
                );
            if (i > 0)
                closureSets.push(
                    holes[i].leftVertices
                        .concat(holes[i].topVertices)
                        .concat(holes[i].rightVertices)
                        .concat(holes[i].bottomVertices)
                );
        }
        return closureSets;
    };

    return {
        createMeshPart,
        createMesh
    };
})();

export default tunnlejs;
