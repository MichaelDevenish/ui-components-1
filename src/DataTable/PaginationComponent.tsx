import React from 'react'
import classnames from 'classnames'

export default class ReactTablePagination extends React.Component<any, any> {
  constructor (props: any) {
    super(props)

    this.getSafePage = this.getSafePage.bind(this)
    this.changePage = this.changePage.bind(this)
    this.applyPage = this.applyPage.bind(this)

    this.state = {
      page: props.page,
    }
  }

  componentWillReceiveProps (nextProps: any) {
    this.setState({ page: nextProps.page })
  }

  getSafePage (page: any) {
    if (Number.isNaN(page)) {
      page = this.props.page
    }
    return Math.min(Math.max(page, 0), this.props.pages - 1)
  }

  changePage (page: any) {
    page = this.getSafePage(page)
    this.setState({ page })
    if (this.props.page !== page) {
      this.props.onPageChange(page)
    }
  }

  applyPage (e: any) {
    if (e) {
      e.preventDefault()
    }
    const page = this.state.page
    this.changePage(page === '' ? this.props.page : page)
  }

  render () {
    const {
      // Computed
      pages,
      // Props
      page,
      showPageSizeOptions,
      pageSizeOptions,
      pageSize,
      showPageJump,
      canPrevious,
      canNext,
      onPageSizeChange,
      className
    } = this.props

    return (
      <div className={classnames(className, '-pagination')} style={this.props.style}>
        <div className="-previous">
          <button
            type="button"
            className="-btn"
            onClick={() => {
              if (!canPrevious) return
              this.changePage(page - 1)
            }}
            disabled={!canPrevious}
          >
            {this.props.previousText}
          </button>
        </div>
        <div className="-center">
          <span className="-pageInfo">
            {this.props.pageText}{' '}
            {showPageJump ? (
              <div className="-pageJump">
                <input
                  type={this.state.page === '' ? 'text' : 'number'}
                  onChange={e => {
                    const val = parseInt(e.target.value)
                    const page = val - 1
                    if (e.target.value === '') {
                      return this.setState({ page: val })
                    }
                    this.setState({ page: this.getSafePage(page) })
                  }}
                  value={this.state.page === '' ? '' : this.state.page + 1}
                  onBlur={this.applyPage}
                  onKeyPress={e => {
                    if (e.which === 13 || e.keyCode === 13) {
                      this.applyPage(e)
                    }
                  }}
                />
              </div>
            ) : (
              <span className="-currentPage">{page + 1}</span>
            )}{' '}
            {this.props.ofText} <span className="-totalPages">{pages || 1}</span>
          </span>
          {showPageSizeOptions && (
            <span className="select-wrap -pageSizeOptions">
              <select onChange={e => onPageSizeChange(Number(e.target.value))} value={pageSize}>
                {pageSizeOptions.map((option: any, i: number) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <option key={i} value={option}>
                    {`${option} ${this.props.rowsText}`}
                  </option>
                ))}
              </select>
            </span>
          )}
        </div>
        <div className="-next">
          <button
            type="button"
            className="-btn"
            onClick={() => {
              if (!canNext) return
              this.changePage(page + 1)
            }}
            disabled={!canNext}
          >
            {this.props.nextText}
          </button>
        </div>
      </div>
    )
  }
}
