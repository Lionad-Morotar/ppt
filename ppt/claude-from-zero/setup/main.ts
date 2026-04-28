import type { AppSetup } from '@slidev/types'

import './deck.css'

// Load deck-wide CSS outside slide templates to avoid Vue SFC side-effect tag errors.
const setupMain: AppSetup = () => {}

export default setupMain
