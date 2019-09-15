<template>
    <div class="row">
        <div class="col-4">
            <div class="row">
                <div class="col-12 q-pa-sm">
                    <q-select
                        option-value="id"
                        option-label="name"
                        emit-value
                        filled
                        map-options
                        v-model="selectedExample"
                        :options="examples"
                        label="Example"
                        dense
                    />
                </div>
                <div class="text-subtitle2 q-pa-sm">Dimensions</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="horizontalSteps"
                        label="horizontalSteps"
                        dense
                    />
                </div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="verticalSteps"
                        label="verticalSteps"
                        dense
                    />
                </div>

                <div class="text-subtitle2 q-pa-sm">Inner Wall</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="innerWallDefinition.x"
                        label="x"
                        dense
                    />
                </div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="innerWallDefinition.y"
                        label="y"
                        dense
                    />
                </div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="innerWallDefinition.z"
                        label="z"
                        dense
                    />
                </div>

                <div class="text-subtitle2 q-pa-sm">Outer Wall</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="outerWallDefinition.x"
                        label="x"
                        dense
                    />
                </div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="outerWallDefinition.y"
                        label="y"
                        dense
                    />
                </div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="outerWallDefinition.z"
                        label="z"
                        dense
                    />
                </div>

                <div class="col-4 q-pa-sm">
                    <button style="width:100%" @click="addHole">Add hole</button>
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center">
                    <button @click="updateExample">Update</button>
                </div>
                <div class="col-4 q-pa-sm">
                    <a
                        style="width:100%"
                        :href="'data:application/octet-stream,' + encodeURIComponent(downloadString)"
                        download="generated.stl"
                    >Download</a>
                </div>
            </div>

            <div class="group">
                <div class="inputOuter">
                    <div class="labelWide">Holes</div>
                </div>
                <div class="inputOuter" v-for="hole in otherHoles">
                    <div class="label">bottom=</div>
                    <input class="inputSmall" v-model="hole.bottom" />
                    <div class="label">top=</div>
                    <input class="inputSmall" v-model="hole.top" />
                    <div class="label">left=</div>
                    <input class="inputSmall" v-model="hole.left" />
                    <div class="label">right=</div>
                    <input class="inputSmall" v-model="hole.right" />
                    <button @click="deleteHole">Delete</button>
                </div>
            </div>
        </div>
        <div class="col-8 q-pa-sm">
            <canvas id="canv" style="width:100%;height:600px"></canvas>
        </div>
    </div>
</template>

<style>
body {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    font-size: 12px;
}

.label {
    width: 20%;
    padding: 2px;
    display: inline-block;
}

.labelWide {
    width: 90%;
    padding: 2px;
    display: inline-block;
}

.group {
    padding: 10px;
}

.inputSmall {
    width: 20%;
}

input,
select {
    width: 70%;
    padding: 2px;
    display: inline-block;
}
</style>

<script>
import simple3dloader from "./../3d/simple3dloader";
import tunnlejs from "./../3d/tunnle";
export default {
    name: "PageHome",
    data() {
        return {
            examples: [
                {
                    name: "Ice cube",
                    id: 0,
                    innerWallDefinition: {
                        x: "i*2.5",
                        y:
                            "(((i%10)<8&&(i%10)>=2)&& ((h%10)>=2&&(h%10)<8))?2:22",
                        z: "h*2.5"
                    },
                    outerWallDefinition: {
                        x: "i*2.5",
                        y:
                            "(((i%10)<9&&(i%10)>=1)&& ((h%10)>=1&&(h%10)<9))?0:20",
                        z: "h*2.5"
                    },
                    horizontalSteps: 30,
                    verticalSteps: 30
                },
                {
                    name: "Wall",
                    id: 1,
                    innerWallDefinition: {
                        x: "i*4",
                        y: "h*3",
                        z: "0+(h%3==0?1+random()*2:0) + (i%5==0?1+random()*2:0)"
                    },
                    outerWallDefinition: {
                        x: "i*4",
                        y: "h*3",
                        z:
                            "40 - (h%3==0?1+random()*2:0) - (i%5==0?1+random()*2:0)"
                    },
                    horizontalSteps: 30,
                    verticalSteps: 30,
                    otherHoles: [{ bottom: 1, top: 15, left: 12, right: 17 }]
                },
                {
                    name: "Roll",
                    id: 2,
                    innerWallDefinition: {
                        x: "sin(2*i*PI/(horizontalSteps))*20",
                        y: "h*3",
                        z: "cos(2*i*PI/(horizontalSteps))*20"
                    },
                    outerWallDefinition: {
                        x: "sin(2*i*PI/(horizontalSteps))*30",
                        y: "h*3",
                        z: "cos(2*i*PI/(horizontalSteps))*30"
                    },
                    horizontalSteps: 30,
                    verticalSteps: 30
                },
                {
                    name: "Pet feeder",
                    id: 9,
                    innerWallDefinition: {
                        x: "sin(2*i*PI/(horizontalSteps))*20",
                        y: "h*2",
                        z: "cos(2*i*PI/(horizontalSteps))*20"
                    },
                    outerWallDefinition: {
                        x: "sin(2*i*PI/(horizontalSteps))*30",
                        y: "h*4",
                        z: "cos(2*i*PI/(horizontalSteps))*30"
                    },
                    horizontalSteps: 30,
                    verticalSteps: 30,
                    otherHoles: []
                },
                {
                    name: "Herringbone-Gear",
                    id: 4,
                    outerWallDefinition: {
                        x:
                            "(i%5<=2?8:10)*sin(2*i*PI/(horizontalSteps)+(h<(verticalSteps/2)?h:(verticalSteps-h))/(2*PI))",
                        y: "h",
                        z:
                            "(i%5<=2?8:10)*cos(2*i*PI/(horizontalSteps)+(h<(verticalSteps/2)?h:(verticalSteps-h))/(2*PI))"
                    },
                    innerWallDefinition: {
                        x:
                            "7*sin(2*i*PI/(horizontalSteps)+(h<(verticalSteps/2)?h:(verticalSteps-h))/(2*PI))",
                        y: "h",
                        z:
                            "7*cos(2*i*PI/(horizontalSteps)+(h<(verticalSteps/2)?h:(verticalSteps-h))/(2*PI))"
                    },
                    horizontalSteps: 100,
                    verticalSteps: 10,
                    otherHoles: []
                },
                {
                    name: "Hairspray cap",
                    id: 5,
                    innerWallDefinition: {
                        x: "sin(2*i*PI/(horizontalSteps))*(h<24?16.3:0)",
                        y: "h",
                        z: "cos(2*i*PI/(horizontalSteps))*(h<24?16.3:0)"
                    },
                    outerWallDefinition: {
                        x: "sin(2*i*PI/(horizontalSteps))*17",
                        y: "h",
                        z: "cos(2*i*PI/(horizontalSteps))*17"
                    },
                    horizontalSteps: 30,
                    verticalSteps: 26
                }
            ],
            innerWallDefinition: {
                x: "i*2.5",
                y: "(((i%10)<8&&(i%10)>=2)&& ((h%10)>=2&&(h%10)<8))?2:22",
                z: "h*2.5"
            },
            outerWallDefinition: {
                x: "i*2.5",
                y: "(((i%10)<9&&(i%10)>=1)&& ((h%10)>=1&&(h%10)<9))?0:20",
                z: "h*2.5"
            },
            horizontalSteps: 30,
            verticalSteps: 30,
            selected: 0,
            otherHoles: [],
            downloadString: ""
        };
    },
    methods: {
        getSurfaceWallFunction: function(
            wallDefinition,
            horizontalSteps,
            verticalSteps
        ) {
            var sin = Math.sin;
            var cos = Math.cos;
            var PI = Math.PI;
            return function(i, h) {
                function random() {
                    var x = Math.sin(i * horizontalSteps + h) * 10000;
                    return x - Math.floor(x);
                }
                var x = eval(wallDefinition.x);
                var y = eval(wallDefinition.y);
                var z = eval(wallDefinition.z);
                return { x, y, z };
            };
        },
        updateExample: function() {
            var loader = new simple3dloader();
            var canvas = document.getElementById("canv");
            loader.init(canvas);
            this.downloadString = tunnlejs.createMesh([
                tunnlejs.createMeshPart(
                    this.holes,
                    this.outerWallFunction,
                    this.innerWallFunction,
                    this.horizontalSteps,
                    this.verticalSteps
                )
            ]);
            loader.setMesh(this.downloadString);
        },
        addHole: function() {
            this.otherHoles.push({ top: 0, left: 0, bottom: 0, right: 0 });
        },
        deleteHole: function(index) {
            this.otherHoles.splice(index, 1);
        }
    },
    computed: {
        selectedExample: {
            get() {
                return this.selected;
            },
            set(selection) {
                this.innerWallDefinition = this.examples[
                    selection
                ].innerWallDefinition;
                this.outerWallDefinition = this.examples[
                    selection
                ].outerWallDefinition;
                this.horizontalSteps = this.examples[selection].horizontalSteps;
                this.verticalSteps = this.examples[selection].verticalSteps;
                this.otherHoles = this.examples[selection].otherHoles || [];
                this.selected = selection;
                this.updateExample();
            }
        },
        innerWallFunction() {
            return this.getSurfaceWallFunction(
                this.innerWallDefinition,
                this.horizontalSteps,
                this.verticalSteps
            );
        },
        outerWallFunction() {
            return this.getSurfaceWallFunction(
                this.outerWallDefinition,
                this.horizontalSteps,
                this.verticalSteps
            );
        },
        holes() {
            return [
                {
                    top: this.verticalSteps - 1,
                    left: 0,
                    bottom: 0,
                    right: this.horizontalSteps - 1
                }
            ].concat(this.otherHoles);
        }
    },
    mounted() {
        this.updateExample();
    }
};
</script>
