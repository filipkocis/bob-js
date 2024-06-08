class Quaternion {
  constructor(angle, v) {
    const halfAngle = toRadians(angle) / 2
    const sin = Math.sin(halfAngle)
    const cos = Math.cos(halfAngle)

    this.x = v.x * sin
    this.y = v.y * sin
    this.z = v.z * sin
    this.w = cos
  }

  static from(x, y, z, w) {
    const q = new Quaternion(0, new Vector3(0,0,0))
    q.x = x
    q.y = y
    q.z = z
    q.w = w

    return q
  }

  static multiplyQV(q, v) {
    const w = - (q.x * v.x) - (q.y * v.y) - (q.z * v.z)
    const x =   (q.w * v.x) + (q.y * v.z) - (q.z * v.y)
    const y =   (q.w * v.y) + (q.z * v.x) - (q.x * v.z)
    const z =   (q.w * v.z) + (q.x * v.y) - (q.y * v.x)

    return Quaternion.from(x, y, z, w)
  }

  static multiplyQQ(l, r) {
    const w = (l.w * r.w) - (l.x * r.x) - (l.y * r.y) - (l.z * r.z)
    const x = (l.x * r.w) + (l.w * r.x) + (l.y * r.z) - (l.z * r.y)
    const y = (l.y * r.w) + (l.w * r.y) + (l.z * r.x) - (l.x * r.z)
    const z = (l.z * r.w) + (l.w * r.z) + (l.x * r.y) - (l.y * r.x)

    return Quaternion.from(x, y, z, w)
  }

  normalize() {
    const length = this.magnitude()
    return Quaternion.from(this.x / length, this.y / length, this.z / length, this.w / length) 
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
  }

  conjugate() {
    return Quaternion.from(-this.x, -this.y, -this.z, this.w)
  }
  toDegrees() {}
}
