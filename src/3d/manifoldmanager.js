import tunnlejs from "./../3d/tunnle";
var manifoldmanager = (function () {
    var allManifolds = JSON.parse(localStorage.getItem("manifolds")) || [
        {
            name: "None",
            id: 0,
            outerWallDefinition: ``,
            innerWallDefinition: ``,
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: 10 },
                { id: "vS", name: "# Vertical steps", value: 10 }
            ]
        },
        {
            name: "HerringboneGear",
            id: 1,
            outerWallDefinition: `x = (i%5<=2?8:10)*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));\ny = h;\nz = (i%5<=2?8:10)*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));`,
            innerWallDefinition: `x = 7*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));\ny = h;\nz = 7*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));`,
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: 100 },
                { id: "vS", name: "# Vertical steps", value: 10 },
                { id: "test", name: "Test", value: 10 }
            ]
        }
    ]

    var getAllManifolds = function () {
        return allManifolds
    }



    var getSurfaceWallFunction = function (parameters) {
        var f = Function(
            "wallDefinition",
            parameters.map(x => x.id),
            `

            var sin = Math.sin;
            var cos = Math.cos;
            var PI = Math.PI;
            return function(i, h) {
                function random() {
                    var x = Math.sin(i * hS + h) * 10000;
                    return x - Math.floor(x);
                }
                var x=0,y=0,z=0;eval(wallDefinition);return { x, y, z };};`
        );

        return f;
    }

    var createManifold = function (manifoldParts) {
        return tunnlejs.createMesh(manifoldParts)
    }

    var createManifoldPart = function (id) {
        var manifold = getAllManifolds().find(x => x.id == id);
        return tunnlejs.createMeshPart(
            [
                {
                    top: manifold.parameters.find(x => x.id == "vS").value - 1,
                    left: 0,
                    bottom: 0,
                    right: manifold.parameters.find(x => x.id == "hS").value - 1
                }
            ],
            getSurfaceWallFunction(manifold.parameters)(
                manifold.outerWallDefinition,
                ...manifold.parameters.map(x => x.value)
            ),
            getSurfaceWallFunction(manifold.parameters)(
                manifold.innerWallDefinition,
                ...manifold.parameters.map(x => x.value)
            ),
            manifold.parameters.find(x => x.id == "hS").value,
            manifold.parameters.find(x => x.id == "vS").value
        )
    }

    return {
        getAllManifolds,
        createManifoldPart,
        createManifold
    };
})();

export default manifoldmanager;
