class Engine {
  constructor(ctx) {
    this.ctx = ctx
    this.camera = Camera.new()
    this.renderer = new Renderer3D(ctx, this.camera)
    this.lights = []
    this.entities = []

    this.lights = defaultLights
    // this.entities = getFloor(50, 20) 
    // this.entities = applyNoiseToFloor(getFloor(50, 20)) 
    // this.entities = getNoisyFloor(100, 20, 30) 
    // this.entities = getPeakyNoiseFloor(50, 20, 100, 10, [0.5, 0.0002, 0.00005]) 
    // this.entities = triangles
    // this.entities.push(getHouse(0,0,0))
    // this.entities = objObj()
    this.entities = [...getPeakyNoiseFloor(50, 20, 100, 10, [0.5, 0.0002, 0.00005]), ...objObj()]

    this.fps = 0
    this.avgFps = 0
    this.fpsList = []
    this.lastTime = 0
  }

  add(entity) {
    this.entities.push(entity)
  }

  update(time) {
    this.camera.update()
    this.entities.map(e => e.update())
    this.renderer.update()
    this.#updateFPS(time)
  }

  draw() {
    this.renderer.draw(this.entities, this.lights)
    this.#drawFPS()
  }

  #drawFPS() {
    this.ctx.fillStyle = 'black'
    this.ctx.font = '18px Arial'
    this.ctx.fillText(`FPS: ${Math.floor(this.fps)}`, 10, 20)
    this.ctx.fillText(`AVG: ${Math.floor(this.avgFps)}`, 10, 40)
    this.ctx.fillText(`MAX: ${Math.floor(Math.max(...this.fpsList))}`, 10, 60)
    this.ctx.fillText(`MIN: ${Math.floor(Math.min(...this.fpsList))}`, 10, 80)
  }

  #updateFPS(time) {
    const delta = time - this.lastTime
    if (delta == 0) return
    this.fps = 1000 / delta
    this.lastTime = time
    this.fpsList.push(this.fps)
    this.avgFps = this.fpsList.reduce((a,b) => a + b, 0) / this.fpsList.length
    if (this.fpsList.length >= 100) this.fpsList.splice(0, 20)
  }
}
