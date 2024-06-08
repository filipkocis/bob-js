// material for the whole mesh
class Material {
  constructor({ ambient, diffuse, specular, shininess }) {
    this.ambient = ambient // rgb coefficients
    this.diffuse = diffuse // rgb coefficients
    this.specular = specular // rgb coefficients
    this.shininess = shininess // 10 for plastic, 100 for metal

    this.#validate()
  }

  #validate() {
    if (!this.ambient) throw new Error('Material ambient rgb coefficient is required')
    if (!this.diffuse) throw new Error('Material diffuse rgb coefficient is required')
    if (!this.specular) throw new Error('Material specular rgb coefficient is required')
    if (!this.shininess) throw new Error('Material shininess is required')
  }
}
