const LightType = Object.freeze({
  AMBIENT: 'ambient', // ambient light, light everywhere
  DIRECTIONAL: 'directional', // directional light, sunlight
  POINT: 'point', // point light, light bulb
  SPOT: 'spot' // point light with a cone, flashlight
})

class Light {
  constructor({ type, intensity = null, position = null, direction = null, angle = null, attenuation = null }) {
    this.type = type // LightType
    this.intensity = intensity // rgb intensity

    this.position = position // in world space, null for ambient and directional lights
    this.direction = direction // for directional and spot lights
    this.angle = angle // cutoff angle for spot lights, the angle of the cone
    this.attenuation = attenuation // for point and spot lights

    this.transformedPosition = this.position ? this.position.copy() : null
    this.transformedDirection = this.direction ? this.direction.copy() : null

    this.#validate()
  }

  #validate() {
    if (!this.type) throw new Error('Light type is required')
    if (!Object.values(LightType).includes(this.type)) throw new Error(`Invalid light type '${this.type}'`)
    if (!this.intensity) throw new Error('Light rgb intensity is required')

    const check = (valid, invalid) => {
      for (const key of invalid) {
        if (this[key] != null) throw new Error(`Invalid property '${key}' for light type '${this.type}'`)
      }
      for (const key of valid) {
        if (this[key] == null) throw new Error(`Missing property '${key}' for light type '${this.type}'`)
      }
    }

    switch (this.type) {
      case LightType.AMBIENT:
        check([], ['position', 'direction', 'angle', 'attenuation'])
        break
      case LightType.DIRECTIONAL:
        check(['direction'], ['position', 'angle', 'attenuation'])
        break
      case LightType.POINT:
        check(['position', 'attenuation'], ['direction', 'angle'])
        break
      case LightType.SPOT:
        check(['position', 'direction', 'angle', 'attenuation'], [])
        break
      default:
        throw new Error(`Light type '${this.type}' not supported`)
    }
  }
}
