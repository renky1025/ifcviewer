export interface ElementProperties {
  modelID: number
  expressID: number
  native: unknown
  propertySets: unknown[]
  typeProperties: unknown[]
  materials: unknown[]
}

export class IfcProperties {
  private manager: any

  constructor(manager: any) {
    this.manager = manager
  }

  async getElementProperties(modelID: number, expressID: number): Promise<ElementProperties> {
    const [native, propertySets, typeProperties, materials] = await Promise.all([
      this.manager.getItemProperties(modelID, expressID, true),
      this.manager.getPropertySets(modelID, expressID, true),
      this.manager.getTypeProperties(modelID, expressID, true),
      this.manager.getMaterialsProperties(modelID, expressID, true),
    ])
    return {
      modelID,
      expressID,
      native,
      propertySets,
      typeProperties,
      materials,
    }
  }

  async getSpatialStructure(modelID: number) {
    const tree = await this.manager.getSpatialStructure(modelID, true)
    return tree
  }
}
