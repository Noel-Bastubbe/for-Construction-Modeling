/**
 * @typedef { () => string } LabelGetter
 *
 * @typedef { {
*   label: string | LabelGetter;
*   actionName: string;
*   className: string;
*   target?: {
*     type: string;
*     isExpanded?: boolean;
*     isInterrupting?: boolean;
*     triggeredByEvent?: boolean;
*     cancelActivity?: boolean;
*     eventDefinitionType?: string;
*     eventDefinitionAttrs?: Record<string, any>
*   };
* } } ReplaceOption
*/

/**
 * @type {ReplaceOption[]}
 */
export var CONNECTION = [
    {
      label: 'Association',
      actionName: 'replace-with-association',
      className: 'bpmn-icon-connection'
    },
    {
      label: 'Inheritance',
      actionName: 'replace-with-inheritance',
      className: 'bpmn-icon-user'
    }
  ];