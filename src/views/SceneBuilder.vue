<template>
    <div class="row">
        <div class="col-4">
            <div class="row">
                <div class="text-subtitle2 q-pa-sm col-12">Code</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        input-style="font-family:monospace;height:600px;"
                        filled
                        square
                        stack-label
                        type="textarea"
                        v-model="code"
                        dense
                    />
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center">
                    <q-btn @click="parseCode" color="primary" style="width:100%">Generate</q-btn>
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center;">
                    <q-btn @click="download" color="primary" style="width:100%">Download</q-btn>
                </div>
            </div>
        </div>
        <div class="col-8 q-pa-sm">
            <canvas id="canv" style="width:100%;height:600px"></canvas>
        </div>
    </div>
</template>

<style>
</style>

<script>
import simple3dloader from "./../3d/simple3dloader";
import manifoldmanager from "./../3d/manifoldmanager";
import { saveAs } from "file-saver";
export default {
    name: "SceneBuilder",
    data() {
        return {
            manifolds: manifoldmanager.getAllManifolds(),
            downloadString: "",
            code:
                localStorage.getItem("code") ||
                `setRotation(0,0,0);
setPosition(0,0,0);
HerringboneGear(100,10,0);
Pole(40,40,6)
setPosition(18.4,0,0);
setRotation(180,9,0);
HerringboneGear(100,10,-10);
setRotation(0,0,0);
Pole(40,40,6)
setPosition(36.8,0,0);
HerringboneGear(100,10,0)
Pole(40,40,6)`
        };
    },
    methods: {
        download() {
            var filename = "Generated.stl";

            var blob = new Blob([this.downloadString], {
                type: "text/plain;charset=utf-8"
            });

            saveAs(blob, filename);
        },
        updateView: function() {
            manifoldmanager.rebuildLanguage();
        },
        parseCode() {
            var loader = new simple3dloader();
            var canvas = document.getElementById("canv");
            loader.init(canvas);
            this.downloadString = manifoldmanager.parseCode(this.code);
            loader.setMesh(this.downloadString);
            localStorage.setItem("code", this.code);
        }
    },
    mounted() {
        this.updateView();
        this.parseCode();
    }
};
</script>
