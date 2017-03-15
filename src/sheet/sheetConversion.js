import {JSONConverter} from 'substance'
import SheetConfigurator from './SheetConfigurator'
import SheetDocument from './model/SheetDocument'

export function importJSON (content) {
  let doc = new SheetDocument()
  let jsonConverter = new JSONConverter()
  jsonConverter.importDocument(doc, content)
  return doc
}

export function exportJSON (doc) {
  let jsonConverter = new JSONConverter()
  return jsonConverter.exportDocument(doc)
}

export function importHTML (content) {
  let htmlImporter = new SheetConfigurator().createImporter('html')
  return htmlImporter.importDocument(content)
}

export function exportHTML (doc) {
  let htmlExporter = new SheetConfigurator().createExporter('html')
  let html = htmlExporter.exportDocument(doc)
  return html
}
