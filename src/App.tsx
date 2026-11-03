
import { useState } from 'react'
import { calculatePlants } from './calculators/planting'
import { GRIDDER_PRESETS, type GridderPreset } from './calculators/gridder'
import PlantingPreview from './components/PlantingPreview'
import './App.css'

function App() {
  const [preset, setPreset] = useState<GridderPreset | 'custom'>('custom')
  const [bedLength, setBedLength] = useState(100)
  const [rows, setRows] = useState(3)
  const [spacing, setSpacing] = useState(12)

  const totalPlants = calculatePlants({
    bedLength,
    rows,
    spacing,
  })


  function handlePresetChange(value: GridderPreset | 'custom') {
    setPreset(value)

    if (value === 'custom') return

      const selected = GRIDDER_PRESETS[value]

      setRows(selected.rows)
      setSpacing(selected.spacing)
  }


  return (
    <div className="planting-calculator">
    <h2>Transplant Calculator</h2>

    <label>
    Bed length (feet)
    <input
    type="number"
    min="0"
    value={bedLength}
    onChange={(e) =>
      setBedLength(e.target.valueAsNumber)
    }
    />
    </label>




    <div className="gridder-selector">
    <span className="field-label">Gridder Pattern</span>

    <div className="gridder-options">
    {Object.entries(GRIDDER_PRESETS).map(
      ([key, config]) => (
        <button
        key={key}
        type="button"
        className={`gridder-button ${
          preset === key ? 'active' : ''
        }`}
        aria-pressed={preset === key}
        onClick={() =>
          handlePresetChange(key as GridderPreset)
        }
        >
        <strong>{key}</strong>
        <small>{config.spacing}"</small>
        </button>
      )
    )}
    </div>

    <button
    type="button"
    className={`custom-button ${
      preset === 'custom' ? 'active' : ''
    }`}
    aria-pressed={preset === 'custom'}
    onClick={() => handlePresetChange('custom')}
    >
    Custom spacing
    </button>
    </div>




    <label>
    Number of rows
    <input
    type="number"
    min="1"
    step="1"
    value={rows}
    onChange={(e) => {
      setRows(e.target.valueAsNumber)
      setPreset('custom')
    }}
    />
    </label>

    <label>
    Plant spacing (inches)
    <input
    type="number"
    min="0"
    value={spacing}
    onChange={(e) => {
      setSpacing(e.target.valueAsNumber)
      setPreset('custom')
    }}
    />
    </label>

    <div className="calculator-result">
    <span>Total transplants needed</span>
    <strong>{totalPlants.toLocaleString()}</strong>
    </div>

    <PlantingPreview
    rows={rows}
    spacing={spacing}
    />

    </div>


  )
}

export default App
