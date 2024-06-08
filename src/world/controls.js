class CameraControls {
  constructor() {
    this.left = 0
    this.right = 0
    this.up = 0
    this.down = 0
    this.forward = 0
    this.backward = 0

    this.dx = 0
    this.dy = 0

    this.#bindKeys()
  }

  #bindKeys() {
    const mapKeyToValue = (key, value) => {
      // rotation
      if (key == 'ArrowUp') this.dx = value
      else if (key == 'ArrowDown') this.dx = -value
      else if (key == 'ArrowLeft') this.dy = value
      else if (key == 'ArrowRight') this.dy = -value
 
      // xy axis
      if (key == 'w') this.forward = value
      else if (key == 's') this.backward = value
      else if (key == 'a') this.left = value
      else if (key == 'd') this.right = value

      // z axis
      else if (key == 'r') this.up = value
      else if (key == 'f') this.down = value
    }

    document.addEventListener('keydown', e => mapKeyToValue(e.key, 1))
    document.addEventListener('keyup', e => mapKeyToValue(e.key, 0))
  }
}
