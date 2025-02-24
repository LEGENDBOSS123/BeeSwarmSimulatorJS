import Vector3 from "./3D/Physics/Math3D/Vector3.mjs";
import Matrix3 from "./3D/Physics/Math3D/Matrix3.mjs";
import Hitbox3 from "./3D/Physics/Broadphase/Hitbox3.mjs";
import Quaternion from "./3D/Physics/Math3D/Quaternion.mjs";
import Triangle from "./3D/Physics/Shapes/Triangle.mjs";
import PhysicsBody3 from "./3D/Physics/Core/PhysicsBody3.mjs";
import Material from "./3D/Physics/Collision/Material.mjs";
import Composite from "./3D/Physics/Shapes/Composite.mjs";
import Sphere from "./3D/Physics/Shapes/Sphere.mjs";
import Box from "./3D/Physics/Shapes/Box.mjs";
import Polyhedron from "./3D/Physics/Shapes/Polyhedron.mjs";
import Point from "./3D/Physics/Shapes/Point.mjs";
import Terrain3 from "./3D/Physics/Shapes/Terrain3.mjs";
import SpatialHash from "./3D/Physics/Broadphase/SpatialHash.mjs";
import World from "./3D/Physics/Core/World.mjs";
import Contact from "./3D/Physics/Collision/Contact.mjs";
import CollisionDetector from "./3D/Physics/Collision/CollisionDetector.mjs";
import SimpleCameraControls from "./3D/SimpleCameraControls.mjs";
import CameraTHREEJS from "./3D/CameraTHREEJS.mjs";
import Player from "./Player.mjs";
import Keysheld from "./3D/Web/Keysheld.mjs";

import Stats from "./3D/Web/Stats.mjs";
import GraphicsEngine from "./3D/Graphics/GraphicsEngine.mjs";

import * as THREE from "three";
import Target from "./Target.mjs";
import EntitySystem from "./EntitySystem.mjs";
import Timer from "./Timer.mjs";
import ParticleSystem from "./ParticleSystem.mjs";
import Particle from "./Particle.mjs";
import TextParticle from "./TextParticle.mjs";
import DistanceConstraint from "./3D/Physics/Collision/DistanceConstraint.mjs";
var stats = new Stats();
var stats2 = new Stats();

stats.showPanel(0);
document.body.appendChild(stats.dom);

stats2.showPanel(0);
stats2.dom.style.left = "85px";
document.body.appendChild(stats2.dom);

var graphicsEngine = new GraphicsEngine({
    window: window,
    document: document,
    container: document.body,
    canvas: document.getElementById("canvas"),
});

graphicsEngine.ambientLight.intensity = 1;

graphicsEngine.setBackgroundImage("3D/Graphics/Textures/autumn_field_puresky_8k.hdr", true, false);

graphicsEngine.setSunlightDirection(new Vector3(-2, -8, -5));
graphicsEngine.setSunlightBrightness(1);
graphicsEngine.disableAO();
graphicsEngine.disableShadows();

graphicsEngine.renderDistance = 2048;
graphicsEngine.cameraFar = 4096;
window.graphicsEngine = graphicsEngine;



top.gameCamera = new CameraTHREEJS({ camera: graphicsEngine.camera, pullback: 5, maxPullback: 40});
var cameraControls = new SimpleCameraControls({
    camera: gameCamera,
    speed: 1,
    pullbackRate: 0.2,
    rotateMethods: {
        wheel: true,
        shiftLock: true,
        drag: true
    },
    rotateSensitivity: {
        wheel: 0.01,
        shiftLock: 0.01,
        drag: 0.01
    },
    shiftLockCursor: document.getElementById('shiftlockcursor'),
    window: window,
    document: document,
    renderDomElement: document.body
});


var keyListener = new Keysheld(window);



document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

window.addEventListener('keydown', function (e) {
    if (e.key == "r") {
        player.respawn();
        return;
    }
});



var world = new World();
var entitySystem = new EntitySystem();

top.world = world;
top.entitySystem = entitySystem;

world.setIterations(4);
world.graphicsEngine = graphicsEngine;

var gravity = -0.8;
for (var i = 0; i < 1; i++) {
    var player = new Player({
        radius: 2.5,
        moveStrength: new Vector3(0.05, 0, 0.05).scale(8),
        jumpStrength: 4,
        global: {
            body: {
                acceleration: new Vector3(0, gravity, 0),
                position: new Vector3(0, 30, 0),
                linearDamping: new Vector3(0.04, 0, 0.04),
                angularDamping: 1
            }
        },
        local: {
            body: {
                mass: 1
            }
        },
        graphicsEngine: graphicsEngine
    });
    top.player = player;
    player.setMeshAndAddToScene({}, graphicsEngine);
    entitySystem.register(player);
    player.addToWorld(world);

}


var addParticle = function (position, damage) {
    var particle = new TextParticle({
        position: position.add(new Vector3(0, 3, 0)),
        duration: 1250,
        swaySpeed: 0.01,
        size: Math.max(-0.25 + damage * 0.1, 0.5),
        swayStrength: Math.min(-0.1 + damage * 0.01, 0.8),
        text: "-" + damage.toString(),
        color: "rgb(200, 36, 21)",
        velocity: new Vector3(0, 0.006, 0),
        damping: 0.005,
        fadeOutSpeed: 0.2,
        fadeInSpeed: 0.2,
        growthSpeed: 0.2,
        shrinkSpeed: 0.2,
    });
    particleSystem.addParticle(particle);
}

top.addParticle = addParticle;

function maxAxis(b) {
    return Math.max((b.max.x - b.min.x),(b.max.y - b.min.y),(b.max.z - b.min.z));
};

function hasOver2000FacesOrVertices(mesh) {
    const geometry = mesh.geometry;
    var n = [0, 1000];
    return true
    const numFaces = geometry.attributes.position.count / 3;
    if (maxAxis(mesh.geometry.boundingBox) < 150 && mesh.material.map?.source?.data?.width != 1024) {
        return false;
    }
    return numFaces > n[0] && numFaces < n[1];
}

for (var i = 0; i < 1; i++) {
    // var composite = new Composite();
    // composite.setLocalFlag(Composite.FLAGS.STATIC, true);
    // top.comp = composite;
    graphicsEngine.load('map.glb', function (gltf) {
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        //graphicsEngine.scene.add(gltf.scene.children[0]);
        gltf.scene.traverse(function (child) {
            child = child.clone();
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.isMesh) {
                //child.quaternion.copy((new THREE.Quaternion(0.7071066498756409, 0, 0, 0.7071066498756409)).multiply(child.quaternion));
                child.material.depthWrite = true;
            }
            if (child.isMesh && hasOver2000FacesOrVertices(child) && 1 == 1) {
                var s = 0;
                //child.scale.x = 30; child.scale.y = 30; child.scale.z = 30;
                var poly = new Polyhedron({ local: { body: { mass: 1 } } }).fromMesh(child, graphicsEngine);
                //poly.global.body.setPosition(new Vector3(Math.random() * 6 * s - 3 * s, 0, Math.random() * 6 * s - 3 * s));
                poly.setRestitution(0);
                poly.setFriction(0);
                //poly.mesh = graphicsEngine.meshLinker.createMeshData(child);
                //poly.addToScene(graphicsEngine.scene);
                //poly.setMeshAndAddToScene({color: Math.floor(Math.random() * 256**3)}, graphicsEngine);

                poly.setLocalFlag(Composite.FLAGS.STATIC, true);
                // composite.add(poly);
                //graphicsEngine.scene.add(child);
                // top.e = child;
                // child.geometry.computeVertexNormals();
                world.addComposite(poly);
                top.poly = poly;
            }
            else if (child.isMesh) {
                //graphicsEngine.scene.add(child);
            }

        });
        player.respawn();
    });
    // world.addComposite(composite);
}
for (var i = 0; i < 1; i++) {
    // var composite = new Composite();
    // composite.setLocalFlag(Composite.FLAGS.STATIC, true);
    // top.comp = composite;
    graphicsEngine.load('bss.glb', function (gltf) {
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        graphicsEngine.scene.add(gltf.scene);
        gltf.scene.traverse(function (child) {
            // child = child.clone();
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.isMesh) {
                //child.quaternion.copy((new THREE.Quaternion(0.7071066498756409, 0, 0, 0.7071066498756409)).multiply(child.quaternion));
                child.material.depthWrite = true;
            }

        });
    });
    // world.addComposite(composite);
}
top.Vector3 = Vector3;
for (var i = 0; i < 0; i++) {
    graphicsEngine.load('world.glb', function (gltf) {
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;

        gltf.scene.traverse(function (child) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.isMesh) {
                var box = new Box({ local: { body: { mass: 1 } } }).fromMesh(child);
                box.setRestitution(0);
                box.setFriction(0);

                box.setLocalFlag(Composite.FLAGS.STATIC, true);
                world.addComposite(box);
                box.mesh = graphicsEngine.meshLinker.createMeshData(child.clone());


                // if (child.name.toLowerCase().includes("checkpoint") || child.name.toLowerCase().includes("spawn")) {
                //     if (child.name.toLowerCase().includes("spawn")) {
                //         player.spawnPoint = box.global.body.position;
                //         if (localStorage["spawnPoint"]) {
                //             player.spawnPoint = Vector3.fromJSON(JSON.parse(localStorage["spawnPoint"]));
                //         }
                //     }
                //     box.addEventListener("postCollision", function (contact) {
                //         if (contact.body1.maxParent == player) {
                //             player.spawnPoint = contact.body2.global.body.position;
                //             localStorage["spawnPoint"] = JSON.stringify(player.spawnPoint.toJSON());
                //         }
                //         else if (contact.body2.maxParent == player) {
                //             player.spawnPoint = contact.body1.global.body.position;
                //             localStorage["spawnPoint"] = JSON.stringify(player.spawnPoint.toJSON());
                //         }
                //     });
                // }
                graphicsEngine.addToScene(box.mesh.mesh);
            }
            else {
            }
        })
        player.respawn();

    });

}

// var sphere2 = new Sphere({
//     radius: 0.5,
//     global: {
//         body: {
//             position: new Vector3(0, 20, 10),
//             acceleration: new Vector3(0, -0.2, 0)
//         }
//     },
//     local: {
//         body: {
//             mass: 0.2
//         }
//     },
//     graphicsEngine: graphicsEngine
// });
// top.sphere2 = sphere2;
// sphere2.setLocalFlag(Composite.FLAGS.CENTER_OF_MASS, true);
// sphere2.setMeshAndAddToScene({}, graphicsEngine);
// world.addComposite(sphere2);


// var poly = new Polyhedron();
// for(var i of poly.localVertices){
//     i.scaleInPlace(30);
// }
// poly.setPosition(new Vector3(0, 29, 0));
// poly.dimensionsChanged();
// poly.setMeshAndAddToScene({}, graphicsEngine);
// poly.setLocalFlag(Composite.FLAGS.STATIC, true);
// world.addComposite(poly);


let spaceBarPressed = false;

document.addEventListener('keydown', function (event) {
    if (event.code === 'KeyX' && !spaceBarPressed) {
        spaceBarPressed = true;
        player.moveStrength = new Vector3(0.05, 0, 0.05).scale(30);
    }
});

document.addEventListener('keyup', function (event) {
    if (event.code === 'KeyX') {
        spaceBarPressed = false;
        player.moveStrength = new Vector3(0.05, 0, 0.05).scale(8);
    }
});
var fps = 20;
var previousWorld = 0;

var timer = new Timer();
var stepper = new Timer.Interval(1000 / fps);
timer.schedule(stepper);
var particleSystem = new ParticleSystem({
    timer: timer,
    graphicsEngine: graphicsEngine
})
top.particleSystem = particleSystem;
function render() {
    stats.begin();
    if (keyListener.isHeld("ArrowUp") || keyListener.isHeld("KeyW")) {

        cameraControls.forward();
    }
    if (keyListener.isHeld("ArrowDown") || keyListener.isHeld("KeyS")) {
        cameraControls.backward();
    }
    if (keyListener.isHeld("ArrowLeft") || keyListener.isHeld("KeyA")) {
        cameraControls.left();
    }
    if (keyListener.isHeld("ArrowRight") || keyListener.isHeld("KeyD")) {
        cameraControls.right();
    }
    if (keyListener.isHeld("Space")) {
        cameraControls.up();
    }
    if (keyListener.isHeld("ShiftLeft") || keyListener.isHeld("ShiftRight")) {
        cameraControls.down();
    }
    if (keyListener.isHeld("KeyO")) {
        cameraControls.zoomOut();
    }
    if (keyListener.isHeld("KeyI")) {
        cameraControls.zoomIn();
    }
    //player.updateHealthTexture(player.composite.mesh, graphicsEngine);
    player.update();
    cameraControls.updateZoom();


    stepper.job = function () {
        if (player.composite.global.body.position.y < -30) {
            //player.respawn();
        }
        stats2.begin();
        previousWorld = world.toJSON();
        top.previousWorld = previousWorld;

        world.step();

        stats2.end();


        if (player.canJump) {
            player.composite.global.body.linearDamping.y = 0;
        }
        if (cameraControls.movement.up && player.canJump) {
            var vel = player.composite.global.body.getVelocity();
            player.composite.global.body.setVelocity(new Vector3(vel.x, vel.y + player.jumpStrength * world.deltaTime, vel.z));
            player.canJump = false;
        }
        else if (cameraControls.movement.up && cameraControls.justToggled.up) {
            if (player.composite.global.body.linearDamping.y == 0) {
                player.composite.global.body.linearDamping.y = 0.1;
                player.composite.global.body.setVelocity(player.composite.global.body.getVelocity().multiply(new Vector3(1, 0, 1)));
            }
            else {
                player.composite.global.body.linearDamping.y = 0;
            }
        }
        var delta2 = cameraControls.getDelta(graphicsEngine.camera);
        if (delta2.magnitudeSquared() == 0 && player.composite.global.body.linearDamping.y != 0) {
            delta2 = player.composite.global.body.rotation.multiplyVector3(new Vector3(0, 0, 1));
        }
        cameraControls.reset();
        var delta3 = new Vector3(delta2.x, 0, delta2.z);
        delta3.normalizeInPlace();
        delta3.y = delta2.y;
        delta3.scaleInPlace(player.composite.global.body.mass * world.deltaTime).multiplyInPlace(player.moveStrength);
        player.composite.applyForce(delta3, player.composite.global.body.position);

    }

    graphicsEngine.update(previousWorld || world, world, stepper.getLerpAmount());
    gameCamera.update(Vector3.from(player.getMainShape()?.mesh?.mesh?.position));
    particleSystem.update();
    graphicsEngine.render();
    timer.step();
    requestAnimationFrame(render);

    stats.end();
}


render();