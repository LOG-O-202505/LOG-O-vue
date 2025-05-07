import { createStore } from 'vuex'
import imageModule from './modules/image'

export default createStore({
  modules: {
    image: imageModule
  }
})