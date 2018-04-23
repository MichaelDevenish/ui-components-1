import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { Radar, defaults as chartJSDefaults } from 'react-chartjs-2'
import { forEach, merge, get } from 'lodash'
import Color from 'color'
import { Parser as HtmlToReactParser } from 'html-to-react'
import classNames from 'classnames'
import { Legend } from '../Legend'

const style = require('./style.scss')

interface Dataset {
  colour: string
  label: string
}

interface Data {
  datasets: Dataset[]
}

interface TooltipItems {
  datasetIndex: number
  yLabel: string
}

export interface RadarChartDataLabels {
  [key: number]: string
}

export interface RadarChartDatasets {
  label: string
  data: number[]
  colour?: string
}

export interface RadarChartProps {
  /** Strings to display instead of the default numerical labels on each tick */
  dataLabels?: RadarChartDataLabels
  /** Array of labels that are placed clockwise around the edge of the chart.  */
  pointLabels: string[]
  /** Set of data to display. Requires a name (label) and array of numbers. RGB colour is optional. */
  datasets: RadarChartDatasets[]
  /** Display legend */
  showLegend?: boolean
  /** RGB colour of dataLabels */
  dataLabelColour?: string
  /** Minimum tick value to display */
  minValue?: number
  /** Maximum tick value to display */
  maxValue?: number
  /** Size of each step between ticks */
  stepSize?: number
}

merge(chartJSDefaults, {
  global: {
    legend: {
      display: false
    }
  }
})

const htmlToReactParser = new HtmlToReactParser()

export class RadarChart extends React.Component<RadarChartProps> {
  public chart: any;

  public static defaultProps: RadarChartProps = {
    pointLabels: [],
    datasets: [],
    showLegend: true,
    minValue: 0,
    maxValue: 5,
    stepSize: 1
  }

  componentDidMount () {
    this.forceUpdate()
  }

  private legendCallback (chart: any): string | null {
    const {
      showLegend
    } = this.props

    const {
      datasets
    } = chart.data

    if (showLegend) {
      return ReactDOMServer.renderToStaticMarkup(
        <Legend datasets={datasets} />
      )
    }

    return null
  }

  private tooltipLabelCallback (tooltipItems: TooltipItems, data: Data) {
    const {
      dataLabels
    } = this.props

    const datasetName = data.datasets[tooltipItems.datasetIndex].label
    const dataPointValue = get(dataLabels, tooltipItems.yLabel, tooltipItems.yLabel)

    return `${datasetName}: ${dataPointValue}`
  }

  get options (): object {
    const {
      dataLabels,
      dataLabelColour,
      minValue,
      maxValue,
      stepSize
    } = this.props

    return {
      legendCallback: (chart: any) => this.legendCallback(chart),
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        titleFontSize: 10,
        callbacks: {
          label: (tooltipItems: TooltipItems, data: Data) => this.tooltipLabelCallback(tooltipItems, data)
        }
      },
      scale: {
        pointLabels: {
          fontSize: 14
        },
        gridLines: {
          circular: true,
          offsetGridLines: true
        },
        ticks: {
          min: minValue,
          max: maxValue,
          stepSize: stepSize,
          fontSize: 10,
          fontColor: dataLabelColour,
          callback: (label: string) => get(dataLabels, label, label)
        }
      }
    }
  }

  get data (): object {
    const {
      datasets,
      pointLabels
    } = this.props

    forEach(datasets, (dataset) => {
      const dataColour = dataset.colour

      return merge(dataset, {
        borderColor: dataColour,
        backgroundColor: Color(dataColour).alpha(0.25),
        pointBorderColor: dataColour,
        pointHoverBackgroundColor: dataColour,
        pointHitRadius: 10,
        pointHoverRadius: 5
      })
    })

    return {
      labels: pointLabels,
      datasets
    }
  }

  public render (): JSX.Element {
    return (
      <div className={classNames(style.radarChartClass, 'radar-chart')}>
        {this.chart && htmlToReactParser.parse(this.chart.chartInstance.generateLegend())}

        <Radar
          data={this.data}
          options={this.options}
          ref={(chart) => { this.chart = chart }}
        />
      </div>
    )
  }
}