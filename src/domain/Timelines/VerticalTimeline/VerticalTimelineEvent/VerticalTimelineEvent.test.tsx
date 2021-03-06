import { mount } from 'enzyme'
import React from 'react'

import { Props } from '../../../../common'
import { Avatar } from '../../../Avatars'
import { VerticalTimelineEvent } from '../VerticalTimelineEvent'

describe('<VerticalTimelineEvent />', () => {
  it(`should render a vertical timeline event`, () => {
    const wrapper = mount(
      <VerticalTimelineEvent
        eventDate='21 Apr'
      >
        Hey this is the child content of the event!
      </VerticalTimelineEvent>
    )

    expect(wrapper).toMatchSnapshot()
  })

  it(`should render a vertical timeline event without an event date`, () => {
    const wrapper = mount(
      <VerticalTimelineEvent>
        Hey this is the child content of the event!
      </VerticalTimelineEvent>
    )

    expect(wrapper).toMatchSnapshot()
  })

  it(`should render a vertical timeline event with a custom event marker`, () => {
    const wrapper = mount(
      <VerticalTimelineEvent
        markerComponent={
          <Avatar
            initials='JW'
            size={Props.AvatarSize.Small}
          />
        }
      >
        Hey this is the child content of the event!
      </VerticalTimelineEvent>
    )

    expect(wrapper).toMatchSnapshot()
  })
})
