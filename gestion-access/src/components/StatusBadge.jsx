import React from 'react'
import './StatusBadge.css'

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'AUTHORIZED':
        return 'status-authorized'
      case 'REFUSED':
        return 'status-refused'
      case 'SUSPICIOUS':
        return 'status-suspicious'
      default:
        return 'status-unknown'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'AUTHORIZED':
        return 'AUTORISÉ'
      case 'REFUSED':
        return 'REFUSÉ'
      case 'SUSPICIOUS':
        return 'SUSPECT'
      default:
        return status
    }
  }

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}

export default StatusBadge

