const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const engine = new Engine(ctx)

function loop(time) {
  engine.update(time)
  engine.draw()

  requestAnimationFrame(loop)
}
loop(0)

const resize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
}
window.addEventListener('resize', resize)
resize()
