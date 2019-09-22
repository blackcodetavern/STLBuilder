import tunnlejs from "./../3d/tunnle";
import simplelinearalgebra from "./simplelinearalgebra";
var manifoldmanager = (function() {
    var me = {};

    me.manifoldArray = [];

    me.positionVector = [0, 0, 0];
    me.rotationAngles = [0, 0, 0];

    me.globalPositionVector = [0, 0, 0];
    me.globalRotationAngles = [0, 0, 0];

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
    ];

    var allCodeBlocks = JSON.parse(localStorage.getItem("codeBlocks")) || [
        {
            name: "None",
            id: 0,
            code: "",
            parameters: []
        },
        {
            name: "TestFunction",
            id: 1,
            code: "",
            parameters: [{ id: "test", name: "Test", value: 10 }]
        }
    ];

    me.getAllManifolds = function() {
        return allManifolds;
    };

    me.getAllCodeBlocks = function() {
        return allCodeBlocks;
    };

    me.getSurfaceWallFunction = function(parameters) {
        var f = Function(
            "wallDefinition",
            parameters.map(x => x.id),
            `

            var sin = Math.sin;
            var cos = Math.cos;
            var PI = Math.PI;
            var fun = function(i, h) {
                function random() {
                    var x = Math.sin(i * hS + h) * 10000;
                    return x - Math.floor(x);
                }
                var x=0,y=0,z=0;
                eval(wallDefinition);
                var vec = {x,y,z}
                vec = this.rotateX(vec,this.globalRotationAngles[0]+this.rotationAngles[0]);
                vec = this.rotateY(vec,this.globalRotationAngles[1]+this.rotationAngles[1]);
                vec = this.rotateZ(vec,this.globalRotationAngles[2]+this.rotationAngles[2]);
                return { x:vec.x + this.globalPositionVector[0] + this.positionVector[0],y: vec.y + this.globalPositionVector[1] + this.positionVector[1], z:vec.z + this.globalPositionVector[2] + this.positionVector[2] };
            };
            fun = fun.bind(this);
            return fun`
        ).bind(me);

        return f;
    };

    me.rotateX = function(v, angleX) {
        return simplelinearalgebra.rotateVectorX(v, angleX);
    };

    me.rotateY = function(v, angleY) {
        return simplelinearalgebra.rotateVectorY(v, angleY);
    };

    me.rotateZ = function(v, angleZ) {
        return simplelinearalgebra.rotateVectorZ(v, angleZ);
    };

    me.parseCode = function(code) {
        me.manifoldArray = [];
        setPosition(0, 0, 0);
        setRotation(0, 0, 0);
        eval(code);
        return me.createManifold(me.manifoldArray);
    };

    me.createManifold = function(manifoldParts) {
        return tunnlejs.createMesh(manifoldParts);
    };

    me.createManifoldPart = function(id) {
        me.manifoldArray = [];
        setPosition(0, 0, 0);
        setRotation(0, 0, 0);
        var manifold = me.getAllManifolds().find(x => x.id == id);
        return tunnlejs.createMeshPart(
            [
                {
                    top: manifold.parameters.find(x => x.id == "vS").value - 1,
                    left: 0,
                    bottom: 0,
                    right: manifold.parameters.find(x => x.id == "hS").value - 1
                }
            ],
            me.getSurfaceWallFunction(manifold.parameters)(
                manifold.outerWallDefinition,
                ...manifold.parameters.map(x => parseInt(x.value))
            ),
            me.getSurfaceWallFunction(manifold.parameters)(
                manifold.innerWallDefinition,
                ...manifold.parameters.map(x => parseInt(x.value))
            ),
            manifold.parameters.find(x => x.id == "hS").value,
            manifold.parameters.find(x => x.id == "vS").value
        );
    };

    me.createManifoldByNameAndParameters = function(
        name,
        parameters,
        parameterNames
    ) {
        var manifold = me.getAllManifolds().find(x => x.name == name);
        var paramNames = parameterNames.map(x => ({
            id: x
        }));
        return tunnlejs.createMeshPart(
            [
                {
                    top: parameters[1] - 1,
                    left: 0,
                    bottom: 0,
                    right: parameters[0] - 1
                }
            ],
            me.getSurfaceWallFunction(paramNames)(
                manifold.outerWallDefinition,
                ...parameters
            ),
            me.getSurfaceWallFunction(paramNames)(
                manifold.innerWallDefinition,
                ...parameters
            ),
            parameters[0],
            parameters[1]
        );
    };
    me.rebuildLanguage = function() {
        for (var i = 0; i < allManifolds.length; i++) {
            var currentManifold = allManifolds[i];
            window[currentManifold.name] = Function(
                currentManifold.parameters.map(x => x.id),
                `this.manifoldArray.push(this.createManifoldByNameAndParameters("` +
                    currentManifold.name +
                    `", [` +
                    currentManifold.parameters.map(x => x.id).join(",") +
                    `],["` +
                    currentManifold.parameters.map(x => x.id).join('","') +
                    `"]));`
            ).bind(me);
        }

        for (var i = 0; i < allCodeBlocks.length; i++) {
            var currentCodeBlock = allCodeBlocks[i];
            window[currentCodeBlock.name] = Function(
                currentCodeBlock.parameters.map(x => x.id),
                currentCodeBlock.code
            ).bind(me);
        }

        window.setPosition = function(x, y, z) {
            me.positionVector = [x, y, z];
        };

        window.setRotation = function(x, y, z) {
            me.rotationAngles = [x, y, z];
        };

        window.setGlobalPosition = function(x, y, z) {
            me.positionVector = [0, 0, 0];
            me.globalPositionVector = [x, y, z];
        };

        window.setGlobalRotation = function(x, y, z) {
            me.rotationAngles = [0, 0, 0];
            me.globalRotationAngles = [x, y, z];
        };
    };

    return me;
})();

export default manifoldmanager;
