class Vector3 {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  copy() {
    return new Vector3(this.x, this.y, this.z)
  }

  normalize() {
    const length = this.magnitude()
    if (length == 0) return new Vector3(0,0,0)
    const vec = new Vector3(this.x / length, this.y / length, this.z / length) 
    return vec
  };

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  rotate(angle, v) {
    const rotationQ = new Quaternion(angle, v)
    const conjugateQ = rotationQ.conjugate()
    // const w = rotationQ.multiply(this).multiply(conjugateQ)

    const qp = Quaternion.multiplyQV(rotationQ, this)
    const w = Quaternion.multiplyQQ(qp, conjugateQ)

    return new Vector3(w.x, w.y, w.z)
  }

  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  subtract(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
  }

  multiply(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar)
  }

  multiplyV(v) {
    return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z)
  }

  multiplyAr(ar) {
    return new Vector3(this.x * ar[0], this.y * ar[1], this.z * ar[2])
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z
  }

  cross(v) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    )
  }

  draw(context) {
    if (this.z <= 0) return;

    context.beginPath()
    context.fillStyle = 'blue'
    context.arc(this.x,this.y,1000/this.z,0,Math.PI*2)  
    context.fill()
    context.closePath()
  }
}

class Vector2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}
