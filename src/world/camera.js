class Camera {
  constructor(wWidth, wHeight, position, target, up) {
    this.fov = 90
    this.wWidth = wWidth
    this.wHeight = wHeight

    this.angleH = 0
    this.angleV = 0

    this.mouse = new Vector2(0, 0)

    this.position = position
    this.target = target.normalize()
    this.up = up.normalize()
    this.speed = 3
    this.rotationSpeed = 1.5

    this.controls = new CameraControls()

    this.#init()
  }

  static new() {
    const pos = new Vector3(-6, 175, 65)
    const target = new Vector3(-1, -0.2, 0)
    const up = new Vector3(0, 1, 0)
    return new Camera(1000, 1000, pos, target, up)
  }

  setPosition(x, y, z) {}
  onKeyboard(key) {}

  update() {
    this.applyControls()
  }

  applyControls() {
    this.updatePosition()
    this.updateRotation()
  }

  updateRotation() {
    if (!this.controls.dx && !this.controls.dy) return 

    if (this.controls.dx) this.angleV -= this.controls.dx * this.rotationSpeed
    if (this.controls.dy) this.angleH += this.controls.dy * this.rotationSpeed

    if (this.angleV > 89) this.angleV = 89
    if (this.angleV < -89) this.angleV = -89
    
    if (this.angleH > 360) this.angleH = 0
    if (this.angleH < 0) this.angleH = 360

    this.#updateAngles()
  }

  updatePosition() {
    if (this.controls.forward) this.position = this.position.add(this.target.multiply(this.speed))
    if (this.controls.backward) this.position = this.position.add(this.target.multiply(-this.speed)) 
    if (this.controls.left) this.position = this.position.add(this.target.cross(this.up).normalize().multiply(this.speed))
    if (this.controls.right) this.position = this.position.add(this.target.cross(this.up).normalize().multiply(-this.speed))
  }

  onMouse(x, y) {
    const dx = x - this.mouse.x
    const dy = y - this.mouse.y

    this.mouse = new Vector2(x, y)

    this.angleH += dx / 20 // * 0.1
    this.angleV += dy / 50 // * 0.1

    this.#updateAngles()
  }

  #updateAngles() {
    const yAxis = new Vector3(0, 1, 0)

    // subtract from 270 to make 0 degrees face the positive x axis and not the positive z axis
    let view = new Vector3(1, 0, 0).rotate(270 - this.angleH, yAxis).normalize()
    const u = yAxis.cross(view).normalize()
    view = view.rotate(this.angleV, u)

    this.target = view.normalize()
    this.up = this.target.cross(u).normalize()
  }

  #init() {
    const hTarget = new Vector3(this.target.x, 0, this.target.z).normalize()
    const angle = toDegrees(Math.asin(Math.abs(hTarget.z)))

    if (hTarget.z >= 0) {
      if (hTarget.x >= 0) this.angleH = 360 - angle
      else this.angleH = 180 + angle
    } else {
      if (hTarget.x >= 0) this.angleH = angle
      else this.angleH = 180 - angle
    }

    this.angleV = -toDegrees(Math.asin(this.target.y))

    this.mouse.x = this.wWidth / 2
    this.mouse.y = this.wHeight / 2

    this.#updateAngles()
  }

  translate(vertices) {
    // y is inverted
    return vertices.map(p => new Vector3(p.x - this.position.x, -(p.y - this.position.y), p.z - this.position.z))
  }

  rotate(vertices) {
    const xAxis = new Vector3(1, 0, 0)
    const yAxis = new Vector3(0, 1, 0)
    const zAxis = new Vector3(0, 0, 1)

    let view = new Vector3(1, 0, 0).rotate(this.angleH, yAxis).normalize()
    const u = yAxis.cross(view).normalize()
    view = view.rotate(this.angleV, u)
    
    return vertices.map(p => {
      // return new Vector3(p.x, p.y, p.z).rotate(this.angleH, yAxis).rotate(this.angleV, u)

      // working, no need for view and u idk why
      return new Vector3(p.x, p.y, p.z).rotate(this.angleH, yAxis).rotate(this.angleV, xAxis)
      // .rotate(180, zAxis)

    })
  }

  // perspective projection
  project(vertices) {
    const factor = 1 / Math.tan(toRadians(this.fov / 2))
    const factorX = factor * this.wWidth
    const factorY = factor * this.wHeight
    
    return vertices.map(p => {
      const x = p.x * factorX / p.z
      const y = p.y * factorY / p.z
      const z = p.z

      return new Vector3(x,y,z)  
    })
  }

  clip(vertices) {
    return vertices.filter(p => p.z > 0)
  }
}
