import React, { useEffect, useRef, useState } from 'react'

import { Variables } from '../../../../common'
import { useClickOutside } from '../../../../common/hooks'
import { Icon } from '../../../Icons'
import { StyledGifButton, StyledGifContainer, StyledGifList, StyledScrollArea } from '../../../Inputs/TextAreaInput/style'
import { Popover } from '../../../Popovers'
import { TextInput } from '../../TextInput'

interface ITenorGifSelectorProps {
  apiKey: string
  setGif: (gifURL: string) => void
}

type FormatTypes = 'gif' | 'tinygif'

interface IMediaObject {
  /** The url to the GIF */
  url: string
  /** The dimensiosn of the image [width, height] */
  dims: [number, number]
  /** A url to a preview image of the GIF */
  preview: string
  /** Size of the file in bytes */
  size: number
}

type Media = {
  [K in FormatTypes]: IMediaObject
}

interface IGifObject {
  /** A unix timestamp representing when this post was created */
  created: number
  /** True if this post contains audio(only video formats support audio, the gif image file format can not contain audio information) */
  hasaudio: boolean
  /** Tenor result identifier */
  id: string
  /**  Array of Media objects containig the url to the GIFs */
  media: Media[]
  /**  An array of tags for the post */
  tags: string[]
  /** The title of the post */
  title: string
  /** the full URL to view the post on tenor.com */
  itemurl: string
  /** True if this post contains captions */
  hascaption: boolean
  /** a short URL to view the post on tenor.com */
  url: string
}

interface IParameters {
  [key: string]: string | number
}

interface IQueryResults {
  results: IGifObject[]
  next: string | number
}

function parameterize (url: string, urlParameters: IParameters): string {
  return Object.entries(urlParameters).reduce<string>((accumulator, entry, index, parameters) => {
    const [key, value] = entry
    const param = `${key}=${value}${index === parameters.length - 1 ? '' : '&'}`
    return accumulator + param
  }, `${url}?`)
}

const TenorGifSelector: React.FC<ITenorGifSelectorProps> = ({ apiKey, setGif }) => {
  const api = 'https://api.tenor.com/v1/'
  const commonParameters = {
    limit: 15,
    locale: 'en_AU',
    contentFilter: 'high',
    media_filter: 'minimal',
    key: apiKey
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [gifs, setGifs] = useState<IGifObject[]>([])
  const [nextID, setNextID] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [trending, setTrending] = useState<IGifObject[]>([])

  const anchorRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const markerGifRef = useRef<HTMLDivElement>(null)
  const [markerIndex, setMarkerIndex] = useState(-1)

  const { ref: gifListRef, opened, toggleOpened } = useClickOutside<HTMLDivElement>(false, anchorRef)

  const searchEndpoint = `${api}search`
  const searchParameters: IParameters = {
    q: searchTerm,
    ...commonParameters
  }

  if (nextID !== null) {
    searchParameters.pos = nextID
  }

  const searchURL = parameterize(searchEndpoint, searchParameters)

  // Set trending
  useEffect(() => {
    const trendingEndpoint = `${api}trending`
    const trendingURL = parameterize(trendingEndpoint, commonParameters)

    fetch(trendingURL)
      .then((response) => response.json())
      .then(
        ({ results }: IQueryResults) => {
          setTrending(results)
          setGifs(results)
          setLoading(false)
        }
      )
  }, [])

  // Fetch GIFs
  useEffect(() => {
    let isLatestResult = true
    if (searchTerm === '') {
      setGifs(trending)
      setMarkerIndex(-1)
      setLoading(false)
    } else {
      setLoading(true)
      fetch(searchURL)
        .then((response) => response.json())
        .then(
          ({ results, next }: IQueryResults) => {
            // Don't set the results if it's stale
            if (isLatestResult) {
              const halfwayPoint = Math.floor(results.length / 2)
              setMarkerIndex(halfwayPoint)
              setGifs(results)
              setNextID(next.toString())
              setLoading(false)
            }
          })
    }
    return () => {
      // Let fetch know the results will be stale
      isLatestResult = false
    }
  }, [searchTerm, trending])

  // Infinite scroll
  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio > 0 && entry.intersectionRatio < 1) {
              const { top } = entry.boundingClientRect
              const parentHeight = scrollAreaRef.current!.clientHeight
              if (top > parentHeight) {
                setLoading(true)
                fetch(searchURL)
                  .then((response) => response.json())
                  .then(({ results, next }: IQueryResults) => {
                    const nextMarker = gifs.length + Math.floor(results.length / 2)
                    setMarkerIndex(nextMarker)
                    setGifs([...gifs, ...results])
                    setNextID(next.toString())
                    setLoading(false)
                  })
              }
            }
          })
        },
        {
          root: scrollAreaRef.current
        }
      )

      if (markerGifRef.current) {
        observer.observe(markerGifRef.current)
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [loading, markerGifRef.current, scrollAreaRef.current])

  const handleGifClick = (url: string) => () => {
    setGif(url)
    toggleOpened()
    setSearchTerm("")
  }

  const handleSearchTermChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setNextID(null)
    setSearchTerm(event.target.value)
  }

  const renderGifs = () => gifs.map((gif: IGifObject, index) => {
    const { gif: actualGif, tinygif } = gif.media[0]
    const { url: previewURL, dims: previewDims } = tinygif
    const [width, height] = previewDims

    return (
      <StyledGifContainer
        key={previewURL + index}
        innerRef={index + 1 === markerIndex ? markerGifRef : undefined}
        onClick={handleGifClick(actualGif.url)}
      >
        <img src={previewURL} width={width} height={height} />
      </StyledGifContainer >
    )
  })

  return (
    <>
      <StyledGifButton
        innerRef={anchorRef}
        opened={opened}
        onClick={toggleOpened}
      >
        GIF
      </StyledGifButton>

      <Popover isOpen={opened} parentRef={anchorRef}>
        <StyledGifList innerRef={gifListRef}>
          <TextInput
            icon={<Icon type='fa-search' />}
            name='searchTerm'
            value={searchTerm}
            handleChange={handleSearchTermChange}
            width='220px'
            placeholder='Search GIFs'
            autoFocus
          />
          <PoweredByTenor />
          <StyledScrollArea innerRef={scrollAreaRef}>
            {renderGifs()}
          </StyledScrollArea>
        </StyledGifList>
      </Popover>
    </>
  )
}

const PoweredByTenor = () => {
  return (
    <div style={{ width: '90px', height: '25px', margin: '-15px 0 5px 128px', userSelect: 'none' }}>
      <svg viewBox='0 0 712 96' version='1.1'>
        <g id='Page-1' stroke='none' strokeWidth='1' fill='#333' fillRule='evenodd'>
          <g id='Powered_by_Tenor_OneLine' fill={Variables.Color.n500}>
            <g id='TENOR_VECTOR' transform='translate(426.000000, 4.000000)'>
              <g id='Page-1'>
                <g>
                  <g id='TENOR_VECTOR'>
                    <g id='TENOR_GREY'>
                      <g id='Layer_1'>
                        <g id='Group'>
                          <path d='M56.4457623,53.3724269 C56.8760985,56.6213403 57.8084935,59.5273128 59.4581155,62.144493 C63.3311412,68.2993789 68.9613728,71.2234009 76.1695039,71.1692524 C82.0866263,71.1331533 87.1610071,68.9672111 91.5360916,64.996317 C93.8312179,62.9025728 97.0587393,63.2996622 98.6724999,65.8085453 C99.8379938,67.6134972 99.604895,69.7974889 97.9911343,71.4219456 C93.0960603,76.3494642 87.2685912,79.4178824 80.3652816,80.2662098 C75.8467517,80.8257449 71.3461525,80.7174478 66.9531373,79.3456844 C56.9478212,76.2231176 50.295541,69.5447957 47.3369798,59.5092633 C43.8763597,47.7229275 45.7232191,36.7668697 53.8816759,27.3450209 C59.4222542,20.9735408 66.5945239,17.9412216 75.0398714,18.0856178 C82.3197251,18.2119644 88.6671838,20.702798 93.7774259,26.027406 C98.0269957,30.4495381 100.375914,35.8463442 101.451754,41.8387844 C101.86416,44.1130238 102.043467,46.4233622 102.151051,48.7337006 C102.276565,51.2786827 100.304191,53.2641298 97.7759662,53.3904764 C97.4173527,53.4085259 97.0587393,53.3904764 96.7001258,53.3904764 L57.7188401,53.3904764 C57.3602267,53.3724269 56.9836825,53.3724269 56.4457623,53.3724269 L56.4457623,53.3724269 L56.4457623,53.3724269 Z M91.4464383,44.293519 C91.1774781,41.9470815 90.5140432,39.7811393 89.6354402,37.6693456 C84.3996833,25.2693262 70.7903016,24.9444349 63.7973387,30.9910237 C60.1215505,34.167739 57.9519389,38.2288807 56.8760985,42.9217556 C56.7685144,43.354944 56.7326531,43.7881325 56.6429997,44.293519 L91.4464383,44.293519 L91.4464383,44.293519 L91.4464383,44.293519 Z' id='Shape' />
                          <path d='M173.999262,48.9683443 C174.017193,33.0125698 186.299705,18.0134197 205.091051,18.0495187 C222.60932,18.0675683 236.039395,31.7310539 236.003533,49.4917804 C235.967672,66.945665 222.268637,80.5550021 204.714507,80.5730516 C187.805881,80.5730516 173.963401,66.3500309 173.999262,48.9683443 L173.999262,48.9683443 L173.999262,48.9683443 Z M225.388574,49.7986222 C225.298921,43.6076373 223.523784,38.4454749 219.632828,34.0774914 C211.689539,25.1429796 197.183624,25.4859205 189.563087,34.691175 C183.215629,42.3622205 182.767362,55.8993595 190.136869,64.2382372 C196.699496,71.6746389 208.497879,73.208848 216.530821,67.433002 C222.645181,63.0289194 225.209268,56.8018355 225.388574,49.7986222 L225.388574,49.7986222 L225.388574,49.7986222 Z' id='Shape' />
                          <path d='M122.556158,26.8215848 C123.68579,25.7386137 124.600255,24.8180883 125.550581,23.9517114 C130.140833,19.728124 135.627619,17.9953702 141.741979,18.0495187 C146.565331,18.1036673 151.101791,19.1866384 155.118262,22.0023633 C160.10299,25.50397 162.810521,30.4675876 163.868431,36.3697803 C164.209114,38.2830292 164.388421,40.2504268 164.406351,42.1997748 C164.460143,53.2460803 164.424282,64.2743362 164.424282,75.3206417 C164.424282,77.4324354 163.097412,79.435932 161.142969,80.1579127 C159.098872,80.9159925 157.18029,80.6091507 155.60239,79.020793 C154.490689,77.9197724 154.00656,76.5299594 154.00656,74.9416018 C154.024491,64.7075247 154.060352,54.4914971 153.970699,44.2574199 C153.952768,42.2358738 153.665878,40.1601792 153.181749,38.2108312 C151.657642,32.2364405 147.408072,28.6084872 141.329574,27.904556 C137.008281,27.3991694 132.902157,28.0850512 129.298091,30.7202809 C124.510601,34.2218875 122.592019,39.2035547 122.574089,44.9794007 C122.538227,55.0510321 122.574089,65.1407131 122.556158,75.2123446 C122.556158,79.0749416 118.826578,81.5838247 115.276304,80.1218137 C113.393583,79.3456844 112.120506,77.2880392 112.120506,74.9777008 L112.120506,59.0038767 L112.120506,23.3560772 C112.120506,21.3164816 113.052901,19.764223 114.774245,18.75345 C116.549382,17.7065779 118.396242,17.7607264 120.135517,18.8617471 C121.623763,19.8183716 122.520297,21.2081845 122.556158,23.0492354 C122.574089,24.2405037 122.556158,25.3956729 122.556158,26.8215848 L122.556158,26.8215848 L122.556158,26.8215848 Z' id='Shape' />
                          <path d='M22.395412,19.276886 L23.5609059,19.276886 L36.4709913,19.276886 C38.4075041,19.276886 39.9854034,19.9086192 40.9895211,21.6594225 C42.6570738,24.601494 40.9536598,28.1572492 37.6185544,28.6626358 C37.0985649,28.7348338 36.542714,28.7528833 36.0047937,28.7528833 L23.5429752,28.7528833 L22.395412,28.7528833 L22.395412,29.7636564 L22.395412,61.9820473 C22.395412,64.1479896 22.7360948,66.2236842 24.1884795,67.9925371 C25.3719039,69.4364986 26.9677339,70.0501822 28.7070093,70.320925 C31.3069571,70.7360639 33.8889742,70.5194697 36.4171992,69.7252909 C38.8199096,68.9491616 41.1867586,70.0321327 41.9936389,72.2883225 C42.8184499,74.5806114 41.6529561,76.8368013 39.4295525,77.9197724 C36.4171992,79.3998329 33.2614006,80.0496156 29.9262952,80.2301108 C21.2837102,80.6632992 13.5197283,74.3459677 12.2107891,65.7182977 C12.0314824,64.5992276 11.9776903,63.4440584 11.9776903,62.3069387 C11.9597597,51.567475 11.9597597,40.8280114 11.9597597,30.0885477 L11.9597597,28.8431309 C11.5652848,28.8250814 11.2425327,28.7889824 10.9377112,28.7889824 C8.96533708,28.7889824 6.99296293,28.8250814 5.02058877,28.7709329 C1.79306742,28.6806853 -0.286890787,26.2440002 0.197237416,23.1755821 C0.537920225,21.0096398 2.49236371,19.3851831 4.94886607,19.312985 C6.88537888,19.2588365 8.83982236,19.2949355 10.7763352,19.2949355 C11.9597597,19.2949355 11.9597597,19.2949355 11.9597597,18.0495187 L11.9597597,5.50510321 C11.9597597,2.43668503 14.1652326,0.0902475937 17.1058632,0.0541485562 C20.0464937,0.0180495187 22.3595507,2.38253647 22.3774814,5.4870537 C22.395412,9.69259156 22.3774814,13.9161789 22.3774814,18.1217168 C22.395412,18.4646577 22.395412,18.825648 22.395412,19.276886 L22.395412,19.276886 L22.395412,19.276886 Z' id='Shape' />
                          <path d='M256.838977,30.7022314 C258.381015,28.9333785 259.743746,27.1825752 261.321645,25.6303166 C264.925711,22.0926109 269.15735,19.6198269 274.142077,18.6271033 C275.648254,18.3202615 277.226153,18.2480634 278.768191,18.3202615 C281.690891,18.4827072 283.878433,20.9374417 283.878433,23.8253647 C283.878433,26.6771887 281.65503,29.0958242 278.768191,29.366567 C276.634441,29.5651117 274.464829,29.6012107 272.366941,30.0524487 C266.611194,31.2978655 262.540931,34.7994721 259.923053,40.0518821 C257.627926,44.6364598 256.856907,49.582028 256.838977,54.6539427 C256.803115,61.4225123 256.838977,68.1910818 256.838977,74.9596513 C256.838977,78.1002676 254.54385,80.5369526 251.585289,80.5189031 C248.608797,80.5008536 246.367463,78.1724656 246.367463,75.0318494 L246.367463,23.2477801 C246.367463,20.9013427 248.017085,18.7714995 250.240489,18.2119644 C252.67906,17.5982808 255.045909,18.6090538 256.103819,20.8652437 C256.516225,21.7316206 256.749323,22.7423936 256.785185,23.7170676 C256.892769,25.7205642 256.821046,27.7421103 256.821046,29.7636564 C256.838977,30.0704982 256.838977,30.3592905 256.838977,30.7022314 L256.838977,30.7022314 L256.838977,30.7022314 Z' id='Shape' />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
            <text id='powered-by' fontFamily='AvenirNext-Regular, Avenir Next' fontSize='75' fontWeight='normal'>
              <tspan x='-3' y='74'>powered by</tspan>
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}

export {
  TenorGifSelector
}
