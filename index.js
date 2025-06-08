/**
 * @typedef {Object} Vector
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Planet
 * @property {Vector} position
 * @property {Vector} velocity
 * @property {number} mass
 */

/** @type {(Planet | "tombstone")[]} */
const planets = [
    { position: { x: 400, y: 600 }, velocity: { x: 0, y: 0 }, mass: 20 },
    { position: { x: 600, y: 400 }, velocity: { x: 10, y: 10 }, mass: 20 },
    { position: { x: 350, y: 300 }, velocity: { x: 20, y: -20 }, mass: 20 },
]

// Helper functions
const round = Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
})
const formatVectors = (/** @type {Vector[]} */ vectors) => {
    let output = ""
    for (const vector of vectors) {
        output += `<tr>
                <td>${round.format(vector.x)}</td>
                <td>${round.format(vector.y)}</td>
            </tr>`
    }
    return output
}
const formatScalars = (/** @type {number[]} */ scalars) => {
    let output = ""
    for (const scalar of scalars) {
        output += `<tr><td>${round.format(scalar)}</td></tr>`
    }
    return output
}

// DOM
/** @type {HTMLDivElement[]} */
const domNodes = []
const addDomNode = () => {
    const div = document.createElement("div")
    div.className = "item"
    document.body.append(div)
    domNodes.push(div)
}
for (let i = 0; i < planets.length; i++) {
    addDomNode()
}

const addPlanet = (/** @type {Vector} */ position) => {
    planets.push({
        position,
        velocity: { x: 0, y: 0 },
        mass: Math.random() * 200,
    })
    addDomNode()
}

const debugToggle = document.querySelector("summary")
if (!debugToggle) throw new Error()

document.addEventListener("click", (event) => {
    if (event.target === debugToggle) return
    const position = { x: event.pageX, y: event.pageY }
    //@ts-ignore
    debugClicks.innerHTML = formatVectors([position])
    addPlanet(position)
})

const COLLISION_DISTANCE = 1

// Animation function
let prevTime = 0
const animate = (/** @type {number} */ time) => {
    const delta = (time - prevTime) / 1000
    prevTime = time

    for (let i = planets.length - 1; i >= 0; i--) {
        const p1 = planets[i]
        if (p1 === "tombstone") {
            planets.splice(i, 1)
            domNodes.splice(i, 1)
            continue
        }

        // Add the forces to velocity
        for (let j = 0; j < planets.length; j++) {
            if (i === j) continue

            const p2 = planets[j]
            if (p2 === "tombstone") throw new Error("tombstone detected")

            const xDelta = p2.position.x - p1.position.x
            const yDelta = p2.position.y - p1.position.y
            const distance = Math.sqrt(xDelta ** 2 + yDelta ** 2)

            if (distance <= COLLISION_DISTANCE) {
                // Collision detected, combine the planets' masses, velocities, and positions
                const combinedMass = p1.mass + p2.mass
                p1.velocity.x =
                    (p1.velocity.x * p1.mass +
                        p2.velocity.x * p2.mass) /
                    combinedMass
                p1.velocity.y =
                    (p1.velocity.y * p1.mass +
                        p2.velocity.y * p2.mass) /
                    combinedMass
                planets[j] = "tombstone" // Mark for removal
            } else {
                // No collision, planets influence each other via gravity
                const attraction = p1.mass + p2.mass
                const direction = { x: xDelta, y: yDelta }

                p1.velocity.x +=
                    (direction.x * delta * attraction) / distance / p1.mass
                p1.velocity.y +=
                    (direction.y * delta * attraction) / distance / p1.mass
            }
        }

        // Add the velocity to position
        p1.position.x += delta * p1.velocity.x
        p1.position.y += delta * p1.velocity.y

        const radius = Math.sqrt(p1.mass)
        domNodes[i].style.left = `${p1.position.x}px`
        domNodes[i].style.top = `${p1.position.y}px`
        domNodes[i].style.width = `${radius}px`
        domNodes[i].style.height = `${radius}px`
    }


    // Update DOM
    debugTime.innerHTML = time
    debugPositions.innerHTML = formatVectors(planets.map(planet => planet.position))
    debugVelocities.innerHTML = formatVectors(planets.map(planet => planet.velocity))
    debugMasses.innerHTML = formatScalars(planets.map(planet => planet.mass))

    requestAnimationFrame(animate)
}
animate(0)
