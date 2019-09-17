var THREE = require("three");
const OrbitControls = require("./OrbitControls");
function simple3dloader() {
    var camera, scene, renderer, mesh, canvas;
    var material = new THREE.MeshPhongMaterial({
        color: 0x027be3,
        specular: 0x000000,
        shininess: 10
    });

    function parse(data) {
        var geometry,
            length,
            normal,
            patternFace,
            patternNormal,
            patternVertex,
            result,
            text;
        geometry = new THREE.Geometry();
        patternFace = /facet([\s\S]*?)endfacet/g;

        while ((result = patternFace.exec(data)) !== null) {
            text = result[0];
            patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

            while ((result = patternNormal.exec(text)) !== null) {
                normal = new THREE.Vector3(
                    parseFloat(result[1]),
                    parseFloat(result[3]),
                    parseFloat(result[5])
                );
            }

            patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
            while ((result = patternVertex.exec(text)) !== null) {
                geometry.vertices.push(
                    new THREE.Vector3(
                        parseFloat(result[1]),
                        parseFloat(result[3]),
                        parseFloat(result[5])
                    )
                );
            }

            length = geometry.vertices.length;
            geometry.faces.push(
                new THREE.Face3(length - 3, length - 2, length - 1, normal)
            );
        }

        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        return geometry;
    }

    function init(canv) {
        canvas = canv;
        scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0x999999));

        camera = new THREE.PerspectiveCamera(35, 1, 1, 500);

        // Z is up for objects intended to be 3D printed.

        camera.up.set(0, 0, 1);
        camera.position.set(0, -9, 3);

        camera.add(new THREE.PointLight(0xffaaaa, 1));

        scene.add(camera);

        var grid = new THREE.GridHelper(5, 50, 0xc10015, 0x888888);
        grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), 90 * (Math.PI / 180));
        scene.add(grid);

        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        renderer.setClearColor(0xffffff);
        renderer.setPixelRatio(window.devicePixelRatio);
        onWindowResize();
        onWindowResize();

        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.addEventListener("change", render);
        controls.target.set(0, 1.2, 2);
        controls.update();
    }

    function setMesh(stl) {
        if (mesh) scene.remove(mesh);

        var geometry = parse(stl);

        mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(0.01, 0.01, 0.01);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

    function getCanvas() {
        return renderer.domElement;
    }

    function onWindowResize() {
        camera.updateProjectionMatrix();
        canvas.style.width = "0";
        canvas.style.height = "0";
        canvas.style.width = "100%";
        canvas.style.height = "600px";
        var size = Math.min(canvas.offsetWidth, 600);
        camera.aspect = 1;

        renderer.setSize(size, size);

        render();
    }

    window.addEventListener("resize", onWindowResize, false);

    return {
        init,
        setMesh,
        getCanvas
    };
}

export default simple3dloader;
