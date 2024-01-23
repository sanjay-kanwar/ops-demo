import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { PluginEnvironment } from '../types';

export class OpsProvider implements EntityProvider {
  private connection?: EntityProviderConnection;
  private env: PluginEnvironment;

  public constructor(env: PluginEnvironment) {
    this.env = env;
  }
  getProviderName(): string {
    return `ops-catalog`;
  }

  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('DB not initilized');
    }
    const catalogObj: any[] = [];
    const staff = await fetch('http://localhost:8080/api/catalog');
    const d = await staff.json();
    // TODO: refine mapping
    for (const entity of d.data) {
      console.log(entity);
      const links = undefined;
      const catalogEntity = {
        kind: `${entity.kind}`,
        apiVersion: 'backstage.io/v1alpha1',
        metadata: {
          annotations: {
            [ANNOTATION_LOCATION]: 'ops:https://www.opscatalog.com/',
            [ANNOTATION_ORIGIN_LOCATION]: 'ops:https://www.opscatalog.com/',
          },
          links,
          // name of the entity
          name: `${entity.class}`,
          title: `${entity.metadata.name}`,
        },
        spec: {
          type: `${entity.classification.type}`,
          lifecycle: 'production',
          owner: 'backstage/maintainers',
          profile: {
            displayName: `${entity.metadata.name}`,
            email: '',
            picture: '',
          },
          memberOf: [],
        },
      };

      catalogObj.push(catalogEntity);
    }

    await this.connection?.applyMutation({
      type: 'full',
      entities: catalogObj.map(entity => {
        return { entity, locationKey: 'ops:https://www.opscatalog.com/' };
      }),
    });
  }
}
