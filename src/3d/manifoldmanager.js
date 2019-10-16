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
            outerWallDefinition: "",
            innerWallDefinition: "",
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: 10 },
                { id: "vS", name: "# Vertical steps", value: 10 }
            ]
        },
        {
            name: "HerringboneGear",
            id: 1,
            outerWallDefinition:
                "x = (i%5<=2?(width-2):width)*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));\ny = h-vS/2;\nz = (i%5<=2?(width-2):width)*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));",
            innerWallDefinition:
                "x = (width-3)*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));\ny = h-vS/2;\nz = (width-3)*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))/(2*PI));",
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: 100 },
                { id: "vS", name: "# Vertical steps", value: 10 },
                { id: "width", name: "Width", value: "10" }
            ]
        },
        {
            name: "Pole",
            id: 3,
            outerWallDefinition:
                "x = width*sin(2*i*PI/(hS));\ny = h-vS/2;\nz = width*cos(2*i*PI/(hS));",
            innerWallDefinition:
                "x = (width-3)*sin(2*i*PI/(hS));\ny = h-vS/2;\nz = (width-3)*cos(2*i*PI/(hS));",
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: 10 },
                { id: "vS", name: "# Vertical steps", value: 10 },
                { id: "width", name: "Width", value: "10" }
            ]
        },
        {
            name: "MinusSphere",
            id: 4,
            outerWallDefinition:
                "x = ((i%4<=1||h%4<=1)?(radius-6):radius)*cos(PI/2+h*PI/(hS))*cos(2*i*PI/(hS));\ny = ((i%4<=1||h%4<=1)?(radius-6):radius)*cos(h*PI/(hS));\nz = ((i%4<=1||h%4<=1)?(radius-6):radius)*cos(PI/2+h*PI/(hS))*sin(2*i*PI/(hS));",
            innerWallDefinition:
                "x = ((i%4<=1||h%4<=1)?(radius-15):radius-10)*cos(PI/2+h*PI/(hS))*cos(2*i*PI/(hS));\ny = ((i%4<=1||h%4<=1)?(radius-15):radius-10)*cos(h*PI/(hS));\nz = ((i%4<=1||h%4<=1)?(radius-15):radius-10)*cos(PI/2+h*PI/(hS))*sin(2*i*PI/(hS));",
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: "60" },
                { id: "vS", name: "# Vertical steps", value: "60" },
                { id: "radius", name: "Radius", value: "40" }
            ]
        },
        {
            name: "Box",
            id: 5,
            outerWallDefinition: "x = i-hS/2\ny = h-vS/2\nz = scaleZ/2",
            innerWallDefinition: "x = i-hS/2\ny = h-vS/2\nz = 0-scaleZ/2",
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: "30" },
                { id: "vS", name: "# Vertical steps", value: "10" },
                { id: "scaleZ", name: "Z-Scaling", value: "20" }
            ]
        },
        {
            name: "FlowerPot",
            id: 6,
            outerWallDefinition:
                "x = width*sin(2*i*PI/(hS))*(1+h*1.5/hS)*(!(h>8&&h<13)&&h%5==0?1.05:1);\ny = h*6 + (h>7?2*sin(20*i*PI/(hS)):0);\nz = width*cos(2*i*PI/(hS))*(1+h*1.5/hS)*(!(h>8&&h<13)&&h%5==0?1.05:1);",
            innerWallDefinition:
                "x = (width-1)*sin(2*i*PI/(hS))*(1+h*1.5/hS);\ny = h*6 + (h>7?2*sin(20*i*PI/(hS)):0);\nz = (width-1)*cos(2*i*PI/(hS))*(1+h*1.5/hS);",
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: "120" },
                { id: "vS", name: "# Vertical steps", value: "15" },
                { id: "width", name: "Breite", value: "29" }
            ]
        },
        {
            name: "Plate",
            id: 7,
            outerWallDefinition:
                "x = (width)*sin(2*i*PI/(hS));\ny = h;\nz = (width)*cos(2*i*PI/(hS));",
            innerWallDefinition: "x = 0;\ny = h;\nz = 0;",
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: "100" },
                { id: "vS", name: "# Vertical steps", value: "3" },
                { id: "width", name: "Width", value: "10" }
            ]
        },
        {
            name: "AnkleSegment",
            id: 8,
            outerWallDefinition:
                "if(i>hS/2&&i<hS){\nx = -bodyLength+radius;\ny = h-vS/2;\nz = (radius)*cos(2*i*PI/(hS));\n}\nelse if(i==hS){\nx = 0;\ny = h-vS/2;\nz = radius;\n}\nelse {\nx = (radius)*sin(2*i*PI/(hS));\ny = h-vS/2;\nz = (radius)*cos(2*i*PI/(hS));\n}",
            innerWallDefinition:
                "x = (radius-thickness)*sin(2*i*PI/(hS));\ny = h-vS/2;\nz = (radius-thickness)*cos(2*i*PI/(hS));",
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: "20" },
                { id: "vS", name: "# Vertical steps", value: "5" },
                { id: "radius", name: "Radius", value: "10" },
                {
                    id: "bodyLength",
                    name: "Body length of the rectangular part",
                    value: "50"
                },
                { id: "thickness", name: "Dicke", value: "2" }
            ]
        },
        {
            name: "DoubleHerringBone",
            id: 9,
            outerWallDefinition:
                "x = ((i%Math.round(hS/steps)<=(Math.floor(hS/steps/2)-1)?(width-2):width))*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))*(angle/360*2*PI)/vS);\ny = h-vS/2;\nz = ((i%Math.round(hS/steps)<=(Math.floor(hS/steps/2)-1)?(width-2):width))*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))*(angle/360*2*PI)/vS);",
            innerWallDefinition:
                "x = ((i%Math.round(hS/steps)<=(Math.floor(hS/steps/2)-1)?(width+2):width)-5)*sin(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))*(angle/360*2*PI)/vS);\ny = h-vS/2;\nz = ((i%Math.round(hS/steps)<=(Math.floor(hS/steps/2)-1)?(width+2):width)-5)*cos(2*i*PI/(hS)+(h<(vS/2)?h:(vS-h))*(angle/360*2*PI)/vS);",
            parameters: [
                { id: "hS", name: "# Horizontal steps", value: "200" },
                { id: "vS", name: "# Vertical steps", value: "20" },
                { id: "width", name: "Breite", value: "30" },
                { id: "steps", name: "Zähne", value: "20" },
                { id: "angle", name: "Zahnradwinkel", value: "45" }
            ]
        }
    ];

    var allCodeBlocks = JSON.parse(localStorage.getItem("codeBlocks")) || [
        { name: "None", id: 0, code: "", parameters: [] },
        {
            name: "FingerAnkle",
            id: 1,
            code:
                "var posX = 0\nsetRotation(0,180,0)\nsetPosition(0,height,0);\nvar fillWidth = fillAnkles?gearWidth-3.4:3\nAnkleSegment(20,5,gearWidth-3.4,((gears+1)*(gearWidth*2-1.5)-2-3)/2,fillWidth)\n\nsetRotation(0,0,0)\nsetPosition(((gears-1+1)*(gearWidth*2-1.5)),height,0);\nAnkleSegment(20,5,gearWidth-3.4,((gears+1)*(gearWidth*2-1.5)-2-3)/2,fillWidth)\n\nsetRotation(0,180,0)\nsetPosition(0,-height,0);\nAnkleSegment(20,5,gearWidth-3.4,((gears+1)*(gearWidth*2-1.5)-2-3)/2,fillWidth)\n\nsetRotation(0,0,0)\nsetPosition(((gears-1+1)*(gearWidth*2-1.5)),-height,0);\nAnkleSegment(20,5,gearWidth-3.4,((gears+1)*(gearWidth*2-1.5)-2-3)/2,fillWidth)\n\n\nfor(var i = 0;i<gears;i++) {\n\nposX = i*(gearWidth*2-1.5);\nif((i+mode)%2==1){\n setRotation(180,9,0);\n}\nelse{\n setRotation(0,0,0)\n}\nsetPosition(posX,0,0);\n\nHerringboneGear(100,10,gearWidth);\n\nif(!(mode==0&&i==0)||fillAll)Pole(40,2*height,gearWidth-3.4)\n\n\n}\nposX = gears*(gearWidth*2-1.5);\nif(fillAll){\nsetPosition(posX,0,0);\nPole(40,2*height,gearWidth-3.4)\n}\n",
            parameters: [
                { id: "gears", name: "Anzahl zahnräder", value: "3" },
                { id: "gearWidth", name: "Zahnradbreite", value: "15" },
                {
                    id: "connectingGear",
                    name: "The gear that connects",
                    value: "0"
                },
                { id: "mode", name: "Zahnradrotation", value: "0" },
                { id: "height", name: "Höhe", value: "10" },
                { id: "fillAll", name: "Überall Balken", value: "1" },
                { id: "fillAnkles", name: "Balken ausfüllen", value: "0" }
            ]
        },
        {
            name: "Finger",
            id: 3,
            code:
                "setGlobalPosition(0,0,0)\nsetGlobalRotation(0,0,0)\nFingerAnkle(3,gearWidth,0,1,10,1,0)\nsetGlobalPosition(((3)*(gearWidth*2-1.5)),0,0)\nPole(40,2*gearWidth+19,gearWidth-3.4-3.4)\nFingerAnkle(2,gearWidth,0,0,17,0,1)\nsetGlobalPosition(((5)*(gearWidth*2-1.5)),0,0)\nPole(40,2*gearWidth+19,gearWidth-3.4-3.4)\nFingerAnkle(2,gearWidth,0,0,10,1,0)",
            parameters: [{ id: "gearWidth", name: "Rear radius", value: "10" }]
        },
        {
            name: "PlanetaryGear",
            id: 4,
            code:
                "setGlobalPosition(0,0,0);\nvar innerRadius = outerRadius - 5;\nvar smallOuterRadius = innerRadius/3 + .9\nvar innerGears = 10;\nvar smallInnerGears = 8;\nsetRotation(0,-1,0);\nDoubleHerringBone(outerRadius*4,6,outerRadius+.1,outerRadius,smallInnerGears /outerRadius*100)\n\n\n\nsetRotation(180,0,0);\nsetPosition(0,0,0)\nDoubleHerringBone(4*innerGears,6,smallOuterRadius*innerGears/smallInnerGears  ,innerGears,smallInnerGears /innerGears *100)\n\nfor(var i = 0;i<3;i++){\nsetPosition((2*smallOuterRadius-0.4) *Math.sin(i*2*Math.PI/3),0,(2*smallOuterRadius-0.4) *Math.cos(i*2*Math.PI/3));\n\nsetRotation(0,21.5,0)\nDoubleHerringBone(4*smallInnerGears ,6,smallOuterRadius-0.8 ,smallInnerGears ,100)\n}\n",
            parameters: [
                { id: "outerRadius", name: "Outer radius", value: "26" }
            ]
        },
        {
            name: "CoolFlowerPot",
            id: 5,
            code: "FlowerPot(120,15,50)\nPlate(120,3,50)",
            parameters: []
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
